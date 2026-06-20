import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { angleBetween, visibilityOf } from "@/lib/pose/angles";
import { getLandmark, POSE } from "@/lib/pose/landmarks";
import { RepStateMachine } from "./base";
import type { ExerciseAnalysis, ExercisePlugin, FormIssue } from "./types";

const machine = new RepStateMachine();

function analyzePullup(landmarks: NormalizedLandmark[]): ExerciseAnalysis {
  const nose = getLandmark(landmarks, POSE.nose);
  const ls = getLandmark(landmarks, POSE.leftShoulder);
  const rs = getLandmark(landmarks, POSE.rightShoulder);
  const le = getLandmark(landmarks, POSE.leftElbow);
  const re = getLandmark(landmarks, POSE.rightElbow);
  const lw = getLandmark(landmarks, POSE.leftWrist);
  const rw = getLandmark(landmarks, POSE.rightWrist);

  if (!ls || !rs || !le || !re || !lw || !rw || !nose) {
    return { phase: "idle", repCompleted: false, formIssues: [{ id: "frame", message: "Side view — upper body and arms in frame", severity: "warn" }] };
  }

  const leftVis = visibilityOf(ls, le, lw);
  const rightVis = visibilityOf(rs, re, rw);
  const useLeft = leftVis >= rightVis;

  const shoulder = useLeft ? ls : rs;
  const elbow = useLeft ? le : re;
  const wrist = useLeft ? lw : rw;
  const elbowAngle = angleBetween(shoulder, elbow, wrist);
  const formIssues: FormIssue[] = [];

  if (machine.phase === "down" && elbowAngle > 150) {
    formIssues.push({ id: "extension", message: "Hang fully at the bottom before pulling", severity: "info" });
  }
  if (nose.y > wrist.y - 0.02 && machine.phase === "down") {
    formIssues.push({ id: "height", message: "Pull chin above hands", severity: "info" });
  }

  const repCompleted = machine.update(elbowAngle, { downBelow: 80, upAbove: 155 });

  return {
    phase: machine.phase,
    repCompleted,
    formIssues,
    metric: Math.round(elbowAngle),
  };
}

export const pullupExercise: ExercisePlugin = {
  id: "pullup",
  name: "Pull-ups",
  description: "Track pull-up reps via elbow flexion (best with side camera).",
  cameraGuide: "Side view — bar or hands visible at top of frame.",
  targetReps: 8,
  targetSets: 3,
  analyze: analyzePullup,
  reset: () => machine.reset(),
};

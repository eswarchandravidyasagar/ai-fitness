import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { angleBetween, lineDeviation, visibilityOf } from "@/lib/pose/angles";
import { getLandmark, POSE } from "@/lib/pose/landmarks";
import { RepStateMachine } from "./base";
import type { ExerciseAnalysis, ExercisePlugin, FormIssue } from "./types";

const machine = new RepStateMachine();

function analyzePushup(landmarks: NormalizedLandmark[]): ExerciseAnalysis {
  const ls = getLandmark(landmarks, POSE.leftShoulder);
  const rs = getLandmark(landmarks, POSE.rightShoulder);
  const le = getLandmark(landmarks, POSE.leftElbow);
  const re = getLandmark(landmarks, POSE.rightElbow);
  const lw = getLandmark(landmarks, POSE.leftWrist);
  const rw = getLandmark(landmarks, POSE.rightWrist);
  const lh = getLandmark(landmarks, POSE.leftHip);
  const rh = getLandmark(landmarks, POSE.rightHip);
  const la = getLandmark(landmarks, POSE.leftAnkle);
  const ra = getLandmark(landmarks, POSE.rightAnkle);

  if (!ls || !rs || !le || !re || !lw || !rw || !lh || !rh || !la || !ra) {
    return { phase: "idle", repCompleted: false, formIssues: [{ id: "frame", message: "Step back so your full body is visible", severity: "warn" }] };
  }

  const leftVis = visibilityOf(ls, le, lw, lh, la);
  const rightVis = visibilityOf(rs, re, rw, rh, ra);
  const useLeft = leftVis >= rightVis;

  const shoulder = useLeft ? ls : rs;
  const elbow = useLeft ? le : re;
  const wrist = useLeft ? lw : rw;
  const hip = useLeft ? lh : rh;
  const ankle = useLeft ? la : ra;

  const elbowAngle = angleBetween(shoulder, elbow, wrist);
  const bodyLine = lineDeviation(shoulder, hip, ankle);
  const formIssues: FormIssue[] = [];

  if (bodyLine > 25) {
    formIssues.push({ id: "body-line", message: "Keep your body in a straight line", severity: "warn" });
  }
  if (machine.phase === "down" && elbowAngle > 100) {
    formIssues.push({ id: "depth", message: "Go lower — chest toward the floor", severity: "info" });
  }

  const repCompleted = machine.update(elbowAngle, { downBelow: 90, upAbove: 160 });

  return {
    phase: machine.phase,
    repCompleted,
    formIssues,
    metric: Math.round(elbowAngle),
  };
}

export const pushupExercise: ExercisePlugin = {
  id: "pushup",
  name: "Push-ups",
  description: "Track reps and body alignment during push-ups.",
  cameraGuide: "Side view — place phone so your full body is in frame.",
  targetReps: 10,
  targetSets: 3,
  analyze: analyzePushup,
  reset: () => machine.reset(),
};

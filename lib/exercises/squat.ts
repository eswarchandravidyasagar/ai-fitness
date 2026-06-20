import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { angleBetween, visibilityOf } from "@/lib/pose/angles";
import { getLandmark, POSE } from "@/lib/pose/landmarks";
import { RepStateMachine } from "./base";
import type { ExerciseAnalysis, ExercisePlugin, FormIssue } from "./types";

const machine = new RepStateMachine();

function analyzeSquat(landmarks: NormalizedLandmark[]): ExerciseAnalysis {
  const lh = getLandmark(landmarks, POSE.leftHip);
  const rh = getLandmark(landmarks, POSE.rightHip);
  const lk = getLandmark(landmarks, POSE.leftKnee);
  const rk = getLandmark(landmarks, POSE.rightKnee);
  const la = getLandmark(landmarks, POSE.leftAnkle);
  const ra = getLandmark(landmarks, POSE.rightAnkle);
  const ls = getLandmark(landmarks, POSE.leftShoulder);
  const rs = getLandmark(landmarks, POSE.rightShoulder);

  if (!lh || !rh || !lk || !rk || !la || !ra) {
    return { phase: "idle", repCompleted: false, formIssues: [{ id: "frame", message: "Show your legs from hip to ankle", severity: "warn" }] };
  }

  const leftVis = visibilityOf(lh, lk, la);
  const rightVis = visibilityOf(rh, rk, ra);
  const useLeft = leftVis >= rightVis;

  const hip = useLeft ? lh : rh;
  const knee = useLeft ? lk : rk;
  const ankle = useLeft ? la : ra;
  const shoulder = useLeft ? ls : rs;

  const kneeAngle = angleBetween(hip, knee, ankle);
  const formIssues: FormIssue[] = [];

  if (shoulder && knee && shoulder.x > knee.x + 0.08) {
    formIssues.push({ id: "lean", message: "Keep chest up — avoid folding forward", severity: "warn" });
  }
  if (machine.phase === "down" && kneeAngle > 110) {
    formIssues.push({ id: "depth", message: "Squat deeper — hips below knee level", severity: "info" });
  }

  const repCompleted = machine.update(kneeAngle, { downBelow: 100, upAbove: 165 });

  return {
    phase: machine.phase,
    repCompleted,
    formIssues,
    metric: Math.round(kneeAngle),
  };
}

export const squatExercise: ExercisePlugin = {
  id: "squat",
  name: "Squats",
  description: "Count squats and cue depth and posture.",
  cameraGuide: "Side or 45° view — hips, knees, and ankles visible.",
  targetReps: 12,
  targetSets: 3,
  analyze: analyzeSquat,
  reset: () => machine.reset(),
};

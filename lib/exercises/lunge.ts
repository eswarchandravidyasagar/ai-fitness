import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { angleBetween, visibilityOf } from "@/lib/pose/angles";
import { getLandmark, POSE } from "@/lib/pose/landmarks";
import { RepStateMachine } from "./base";
import type { ExerciseAnalysis, ExercisePlugin, FormIssue } from "./types";

const machine = new RepStateMachine();

function analyzeLunge(landmarks: NormalizedLandmark[]): ExerciseAnalysis {
  const lh = getLandmark(landmarks, POSE.leftHip);
  const rh = getLandmark(landmarks, POSE.rightHip);
  const lk = getLandmark(landmarks, POSE.leftKnee);
  const rk = getLandmark(landmarks, POSE.rightKnee);
  const la = getLandmark(landmarks, POSE.leftAnkle);
  const ra = getLandmark(landmarks, POSE.rightAnkle);

  if (!lh || !rh || !lk || !rk || !la || !ra) {
    return { phase: "idle", repCompleted: false, formIssues: [{ id: "frame", message: "Side view — show both legs", severity: "warn" }] };
  }

  const leftVis = visibilityOf(lh, lk, la);
  const rightVis = visibilityOf(rh, rk, ra);
  const front = leftVis >= rightVis
    ? { hip: lh, knee: lk, ankle: la }
    : { hip: rh, knee: rk, ankle: ra };

  const kneeAngle = angleBetween(front.hip, front.knee, front.ankle);
  const formIssues: FormIssue[] = [];

  if (machine.phase === "down" && kneeAngle > 110) {
    formIssues.push({ id: "depth", message: "Lower until front thigh is parallel", severity: "info" });
  }
  if (front.knee.x > front.ankle.x + 0.06) {
    formIssues.push({ id: "knee", message: "Keep front knee over ankle", severity: "warn" });
  }

  const repCompleted = machine.update(kneeAngle, { downBelow: 95, upAbove: 160 });

  return {
    phase: machine.phase,
    repCompleted,
    formIssues,
    metric: Math.round(kneeAngle),
  };
}

export const lungeExercise: ExercisePlugin = {
  id: "lunge",
  name: "Lunges",
  description: "Count lunges and check front knee alignment.",
  cameraGuide: "Side view — full legs visible.",
  targetReps: 10,
  targetSets: 3,
  analyze: analyzeLunge,
  reset: () => machine.reset(),
};

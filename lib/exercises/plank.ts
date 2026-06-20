import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { lineDeviation, visibilityOf } from "@/lib/pose/angles";
import { getLandmark, POSE } from "@/lib/pose/landmarks";
import { HoldTracker } from "./base";
import type { ExerciseAnalysis, ExercisePlugin, FormIssue } from "./types";

const tracker = new HoldTracker();
let lastNow = 0;

function analyzePlank(landmarks: NormalizedLandmark[]): ExerciseAnalysis {
  const ls = getLandmark(landmarks, POSE.leftShoulder);
  const rs = getLandmark(landmarks, POSE.rightShoulder);
  const lh = getLandmark(landmarks, POSE.leftHip);
  const rh = getLandmark(landmarks, POSE.rightHip);
  const la = getLandmark(landmarks, POSE.leftAnkle);
  const ra = getLandmark(landmarks, POSE.rightAnkle);

  if (!ls || !rs || !lh || !rh || !la || !ra) {
    return { phase: "idle", repCompleted: false, formIssues: [{ id: "frame", message: "Side view — full body in plank position", severity: "warn" }] };
  }

  const leftVis = visibilityOf(ls, lh, la);
  const rightVis = visibilityOf(rs, rh, ra);
  const useLeft = leftVis >= rightVis;

  const shoulder = useLeft ? ls : rs;
  const hip = useLeft ? lh : rh;
  const ankle = useLeft ? la : ra;

  const bodyLine = lineDeviation(shoulder, hip, ankle);
  const inPosition = bodyLine < 20 && hip.y < shoulder.y + 0.05;
  const now = performance.now();
  if (lastNow === 0) lastNow = now;
  tracker.update(inPosition, now);
  lastNow = now;

  const formIssues: FormIssue[] = [];
  if (bodyLine > 20 && hip.y > shoulder.y) {
    formIssues.push({ id: "sag", message: "Hips sagging — squeeze glutes", severity: "warn" });
  } else if (bodyLine > 20 && hip.y < shoulder.y - 0.05) {
    formIssues.push({ id: "pike", message: "Hips too high — lower to straight line", severity: "warn" });
  }

  return {
    phase: tracker.holding ? "hold" : "idle",
    repCompleted: false,
    formIssues,
    metric: Math.round(tracker.holdMs / 1000),
  };
}

export const plankExercise: ExercisePlugin = {
  id: "plank",
  name: "Plank",
  description: "Hold timer with hip alignment feedback.",
  cameraGuide: "Side view — body horizontal, full profile visible.",
  targetReps: 60,
  targetSets: 3,
  isHold: true,
  analyze: analyzePlank,
  reset: () => {
    tracker.reset();
    lastNow = 0;
  },
};

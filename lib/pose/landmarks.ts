import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { Point } from "./angles";

export const POSE = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

export function toPoint(lm: NormalizedLandmark): Point {
  return { x: lm.x, y: lm.y, visibility: lm.visibility ?? 1 };
}

export function getLandmark(
  landmarks: NormalizedLandmark[],
  index: number,
): Point | null {
  const lm = landmarks[index];
  if (!lm) return null;
  return toPoint(lm);
}

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28],
];

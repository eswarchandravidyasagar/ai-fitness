import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

let landmarker: PoseLandmarker | null = null;

export async function initPoseLandmarker(): Promise<PoseLandmarker> {
  if (landmarker) return landmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
  );

  landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });

  return landmarker;
}

export function detectPose(
  video: HTMLVideoElement,
  timestamp: number,
): NormalizedLandmark[] | null {
  if (!landmarker) return null;
  const result = landmarker.detectForVideo(video, timestamp);
  return result.landmarks[0] ?? null;
}

export function disposePoseLandmarker(): void {
  landmarker?.close();
  landmarker = null;
}

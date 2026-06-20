import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type ExercisePhase = "idle" | "up" | "down" | "hold";

export type FormIssue = {
  id: string;
  message: string;
  severity: "info" | "warn";
};

export type ExerciseAnalysis = {
  phase: ExercisePhase;
  repCompleted: boolean;
  formIssues: FormIssue[];
  metric?: number;
};

export type ExercisePlugin = {
  id: string;
  name: string;
  description: string;
  cameraGuide: string;
  targetReps: number;
  targetSets: number;
  isHold?: boolean;
  analyze: (landmarks: NormalizedLandmark[]) => ExerciseAnalysis;
  reset: () => void;
};

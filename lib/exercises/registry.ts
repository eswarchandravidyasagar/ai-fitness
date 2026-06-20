import type { ExercisePlugin } from "./types";
import { lungeExercise } from "./lunge";
import { plankExercise } from "./plank";
import { pullupExercise } from "./pullup";
import { pushupExercise } from "./pushup";
import { squatExercise } from "./squat";

export const EXERCISES: ExercisePlugin[] = [
  pushupExercise,
  squatExercise,
  pullupExercise,
  lungeExercise,
  plankExercise,
];

export const EXERCISE_IDS = EXERCISES.map((e) => e.id);

export function getExercise(id: string): ExercisePlugin | undefined {
  return EXERCISES.find((e) => e.id === id);
}

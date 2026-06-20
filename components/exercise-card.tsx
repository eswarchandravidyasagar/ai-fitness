import Link from "next/link";
import type { ExercisePlugin } from "@/lib/exercises/types";

type Props = { exercise: ExercisePlugin };

export function ExerciseCard({ exercise }: Props) {
  return (
    <Link
      href={`/workout/${exercise.id}`}
      className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 transition hover:border-emerald-500/50 hover:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold text-zinc-50 group-hover:text-emerald-400">
        {exercise.name}
      </h2>
      <p className="mt-2 flex-1 text-sm text-zinc-400">{exercise.description}</p>
      <p className="mt-4 text-xs text-zinc-500">{exercise.cameraGuide}</p>
      <span className="mt-4 text-sm font-medium text-emerald-500">
        {exercise.isHold
          ? `${exercise.targetReps}s × ${exercise.targetSets} sets`
          : `${exercise.targetReps} reps × ${exercise.targetSets} sets`}
        {" →"}
      </span>
    </Link>
  );
}

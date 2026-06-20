import { ExerciseCard } from "@/components/exercise-card";
import { EXERCISES } from "@/lib/exercises/registry";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          AI Fitness Coach
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Free live camera tracking for reps, sets, and form cues. Pose AI runs
          entirely in your browser — your video never leaves your device.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXERCISES.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      <footer className="mt-auto pt-12 text-center text-xs text-zinc-600">
        <p>Not medical advice. Use a stable camera angle and good lighting.</p>
        <p className="mt-1">
          Powered by MediaPipe Pose · Voice via Web Speech API
        </p>
      </footer>
    </div>
  );
}

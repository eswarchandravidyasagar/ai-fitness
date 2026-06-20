type Props = {
  repsInSet: number;
  targetReps: number;
  currentSet: number;
  targetSets: number;
  isHold?: boolean;
  holdSeconds?: number;
};

export function RepCounter({
  repsInSet,
  targetReps,
  currentSet,
  targetSets,
  isHold,
  holdSeconds,
}: Props) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Set {currentSet} / {targetSets}
      </p>
      <p className="mt-2 text-7xl font-bold tabular-nums text-emerald-400">
        {isHold ? holdSeconds ?? 0 : repsInSet}
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        {isHold ? `seconds (goal ${targetReps}s)` : `/ ${targetReps} reps`}
      </p>
    </div>
  );
}

type Props = { secondsLeft: number };

export function RestTimer({ secondsLeft }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400">Rest</p>
        <p className="mt-4 text-8xl font-bold tabular-nums text-emerald-400">
          {secondsLeft}
        </p>
        <p className="mt-2 text-zinc-500">Get ready for the next set</p>
      </div>
    </div>
  );
}

type Props = { message: string | null; phase?: string };

export function FormCueBanner({ message, phase }: Props) {
  if (!message && !phase) return null;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 py-3 backdrop-blur">
      {phase && (
        <p className="text-xs uppercase tracking-wide text-zinc-500">{phase}</p>
      )}
      {message && (
        <p className="mt-1 text-sm font-medium text-amber-300">{message}</p>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { WorkoutCamera } from "@/components/workout-camera";
import { EXERCISE_IDS, getExercise } from "@/lib/exercises/registry";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return EXERCISE_IDS.map((id) => ({ id }));
}

export default async function WorkoutPage({ params }: Props) {
  const { id } = await params;
  if (!getExercise(id)) notFound();

  return <WorkoutCamera exerciseId={id} />;
}

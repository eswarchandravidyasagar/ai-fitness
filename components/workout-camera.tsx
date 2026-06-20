"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { FormCueBanner } from "@/components/form-cue-banner";
import { RepCounter } from "@/components/rep-counter";
import { RestTimer } from "@/components/rest-timer";
import {
  isVoiceMuted,
  setVoiceMuted,
  speak,
  speakRep,
  speakRestDone,
  speakSetComplete,
} from "@/lib/coach/voice";
import { getExercise } from "@/lib/exercises/registry";
import type { ExercisePlugin } from "@/lib/exercises/types";
import { POSE_CONNECTIONS } from "@/lib/pose/landmarks";
import {
  detectPose,
  disposePoseLandmarker,
  initPoseLandmarker,
} from "@/lib/pose/landmarker";
import {
  createSession,
  recordRep,
  tickRest,
  type SessionState,
} from "@/lib/session/tracker";

type Props = { exerciseId: string };

const REST_SECONDS = 60;

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
) {
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 3;
  for (const [a, b] of POSE_CONNECTIONS) {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    if (!p1 || !p2) continue;
    ctx.beginPath();
    ctx.moveTo(p1.x * width, p1.y * height);
    ctx.lineTo(p2.x * width, p2.y * height);
    ctx.stroke();
  }
  ctx.fillStyle = "#6ee7b7";
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function WorkoutCamera({ exerciseId }: Props) {
  const exercise = getExercise(exerciseId);
  if (!exercise) {
    return (
      <div className="p-8 text-center">
        <p>Exercise not found.</p>
        <Link href="/" className="text-emerald-400">
          ← Back
        </Link>
      </div>
    );
  }
  return <WorkoutSession exercise={exercise} />;
}

function WorkoutSession({ exercise }: { exercise: ExercisePlugin }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef(-1);
  const lastCueRef = useRef("");
  const lastCueTimeRef = useRef(0);
  const holdCompletedRef = useRef(false);
  const sessionRef = useRef<SessionState>(
    createSession({
      targetReps: exercise.targetReps,
      targetSets: exercise.targetSets,
      restSeconds: REST_SECONDS,
      isHold: exercise.isHold,
    }),
  );

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [session, setSession] = useState<SessionState>(() => createSession({ targetReps: exercise.targetReps, targetSets: exercise.targetSets, restSeconds: REST_SECONDS, isHold: exercise.isHold }));
  const [phase, setPhase] = useState("idle");
  const [cue, setCue] = useState<string | null>(null);
  const [metric, setMetric] = useState<number | undefined>();
  const [fps, setFps] = useState(0);

  const toggleMute = () => {
    const next = !isVoiceMuted();
    setVoiceMuted(next);
    setMuted(next);
  };

  const resetWorkout = useCallback(() => {
    exercise.reset();
    holdCompletedRef.current = false;
    const fresh = createSession({
      targetReps: exercise.targetReps,
      targetSets: exercise.targetSets,
      restSeconds: REST_SECONDS,
      isHold: exercise.isHold,
    });
    sessionRef.current = fresh;
    setSession(fresh);
    lastCueRef.current = "";
  }, [exercise]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    async function start() {
      try {
        await initPoseLandmarker();
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        const video = videoRef.current;
        if (!video || !mounted) return;
        video.srcObject = stream;
        await video.play();
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Camera access denied");
      }
    }

    start();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      disposePoseLandmarker();
    };
  }, []);

  useEffect(() => {
    if (!session.resting) return;
    const id = setInterval(() => {
      setSession((prev) => {
        const next = tickRest(prev);
        if (prev.resting && !next.resting) speakRestDone();
        sessionRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session.resting]);

  useEffect(() => {
    if (!ready || paused) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    let lastFpsTime = performance.now();

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);

      if (video.readyState < 2) return;
      if (video.currentTime === lastVideoTimeRef.current) return;
      lastVideoTimeRef.current = video.currentTime;

      const landmarks = detectPose(video, performance.now());
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);

      if (landmarks) {
        drawSkeleton(ctx, landmarks, w, h);
        const analysis = exercise.analyze(landmarks);
        setPhase(analysis.phase);
        setMetric(analysis.metric);

        const topIssue = analysis.formIssues[0];
        if (topIssue) {
          setCue(topIssue.message);
          const now = Date.now();
          if (
            topIssue.message !== lastCueRef.current ||
            now - lastCueTimeRef.current > 4000
          ) {
            speak(topIssue.message);
            lastCueRef.current = topIssue.message;
            lastCueTimeRef.current = now;
          }
        } else {
          setCue(null);
        }

        const s = sessionRef.current;
        let repCompleted = analysis.repCompleted;

        if (exercise.isHold && analysis.metric !== undefined) {
          if (
            analysis.metric >= exercise.targetReps &&
            !holdCompletedRef.current
          ) {
            repCompleted = true;
            holdCompletedRef.current = true;
          }
          if (analysis.phase !== "hold") {
            holdCompletedRef.current = false;
          }
        }

        if (!s.resting && !s.finished && repCompleted) {
          setSession((prev) => {
            const wasResting = prev.resting;
            const next = recordRep(prev, {
              targetReps: exercise.targetReps,
              targetSets: exercise.targetSets,
              restSeconds: REST_SECONDS,
              isHold: exercise.isHold,
            });
            sessionRef.current = next;
            if (!wasResting && next.repsInSet > prev.repsInSet) {
              speakRep(next.repsInSet);
            }
            if (!wasResting && next.resting && !prev.resting) {
              speakSetComplete(prev.currentSet);
            }
            if (exercise.isHold) holdCompletedRef.current = false;
            return next;
          });
        }
      }

      frameCount += 1;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = now;
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, paused, exercise]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-red-400">{error}</p>
        <p className="mt-4 text-sm text-zinc-500">
          Camera requires HTTPS. Allow permission and reload.
        </p>
        <Link href="/" className="mt-6 inline-block text-emerald-400">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Exercises
        </Link>
        <h1 className="font-semibold text-zinc-100">{exercise.name}</h1>
        <span className="text-xs text-zinc-600">{fps} fps</span>
      </header>

      <div className="relative flex-1 bg-black">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas
          ref={canvasRef}
          className="h-full max-h-[60vh] w-full object-contain"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
            <p className="text-zinc-400">Loading camera & pose model…</p>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <FormCueBanner message={cue} phase={phase} />
          <RepCounter
            repsInSet={session.repsInSet}
            targetReps={exercise.targetReps}
            currentSet={session.currentSet}
            targetSets={exercise.targetSets}
            isHold={exercise.isHold}
            holdSeconds={metric}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-zinc-800 p-4">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          onClick={resetWorkout}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
        >
          {muted ? "Unmute voice" : "Mute voice"}
        </button>
      </div>

      <p className="px-4 pb-4 text-center text-xs text-zinc-600">
        {exercise.cameraGuide}
        {metric !== undefined && !exercise.isHold && (
          <> · Joint angle: {metric}°</>
        )}
      </p>

      {session.resting && <RestTimer secondsLeft={session.restSecondsLeft} />}
      {session.finished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              Workout complete!
            </p>
            <p className="mt-2 text-zinc-400">{session.totalReps} total reps</p>
            <button
              type="button"
              onClick={resetWorkout}
              className="mt-6 rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-500"
            >
              Start again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

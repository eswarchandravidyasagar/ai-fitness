import type { ExercisePhase } from "./types";

export type RepThresholds = {
  downBelow: number;
  upAbove: number;
};

export class RepStateMachine {
  phase: ExercisePhase = "idle";
  reps = 0;
  private hitDepth = false;

  reset(): void {
    this.phase = "idle";
    this.reps = 0;
    this.hitDepth = false;
  }

  update(angle: number, thresholds: RepThresholds): boolean {
    const isDown = angle < thresholds.downBelow;
    const isUp = angle > thresholds.upAbove;
    let completed = false;

    if (this.phase === "idle" || this.phase === "up") {
      if (isDown) {
        this.phase = "down";
        this.hitDepth = true;
      } else if (isUp) {
        this.phase = "up";
      }
    }

    if (this.phase === "down") {
      if (isDown) this.hitDepth = true;
      if (isUp && this.hitDepth) {
        this.phase = "up";
        this.reps += 1;
        this.hitDepth = false;
        completed = true;
      }
    }

    return completed;
  }
}

export class HoldTracker {
  holding = false;
  holdMs = 0;
  private holdStart: number | null = null;

  reset(): void {
    this.holding = false;
    this.holdMs = 0;
    this.holdStart = null;
  }

  update(inPosition: boolean, now: number): void {
    if (inPosition) {
      if (!this.holding) {
        this.holding = true;
        this.holdStart = now;
      } else if (this.holdStart !== null) {
        this.holdMs = now - this.holdStart;
      }
    } else {
      this.holding = false;
      this.holdStart = null;
      this.holdMs = 0;
    }
  }
}

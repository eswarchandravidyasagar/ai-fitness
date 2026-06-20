export type SessionState = {
  currentSet: number;
  repsInSet: number;
  totalReps: number;
  resting: boolean;
  restSecondsLeft: number;
  finished: boolean;
};

export type SessionConfig = {
  targetReps: number;
  targetSets: number;
  restSeconds: number;
  isHold?: boolean;
};

export function createSession(_: SessionConfig): SessionState {
  return {
    currentSet: 1,
    repsInSet: 0,
    totalReps: 0,
    resting: false,
    restSecondsLeft: 0,
    finished: false,
  };
}

export function recordRep(state: SessionState, config: SessionConfig): SessionState {
  if (state.resting || state.finished) return state;

  const repsInSet = state.repsInSet + 1;
  const totalReps = state.totalReps + 1;

  if (repsInSet >= config.targetReps) {
    if (state.currentSet >= config.targetSets) {
      return { ...state, repsInSet, totalReps, finished: true };
    }
    return {
      ...state,
      repsInSet: 0,
      totalReps,
      resting: true,
      restSecondsLeft: config.restSeconds,
    };
  }

  return { ...state, repsInSet, totalReps };
}

export function tickRest(state: SessionState): SessionState {
  if (!state.resting) return state;
  const restSecondsLeft = state.restSecondsLeft - 1;
  if (restSecondsLeft <= 0) {
    return {
      ...state,
      resting: false,
      restSecondsLeft: 0,
      currentSet: state.currentSet + 1,
    };
  }
  return { ...state, restSecondsLeft };
}

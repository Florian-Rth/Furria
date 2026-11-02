export const AUTOSAVE_QUIET_MS = 800;

export type SaveStatus = 'saved' | 'saving' | 'failed';

export interface AutosaveState {
  dirty: boolean;
  gesture: boolean;
  saving: boolean;
  failed: boolean;
  dueAt: number | null;
}

export type AutosaveEvent =
  | { kind: 'changed'; at: number }
  | { kind: 'gestureStarted' }
  | { kind: 'gestureEnded'; at: number }
  | { kind: 'left'; at: number }
  | { kind: 'retried'; at: number }
  | { kind: 'saveStarted' }
  | { kind: 'saveSucceeded'; at: number }
  | { kind: 'saveFailed' }
  | { kind: 'replayed'; at: number };

export const AUTOSAVE_IDLE: AutosaveState = {
  dirty: false,
  gesture: false,
  saving: false,
  failed: false,
  dueAt: null,
};

const quietAfter = (at: number): number => at + AUTOSAVE_QUIET_MS;

export const autosaveAfter = (state: AutosaveState, event: AutosaveEvent): AutosaveState => {
  switch (event.kind) {
    case 'changed':
      return { ...state, dirty: true, dueAt: state.gesture ? null : quietAfter(event.at) };
    case 'gestureStarted':
      return { ...state, gesture: true, dueAt: null };
    case 'gestureEnded':
      return { ...state, gesture: false, dueAt: state.dirty ? quietAfter(event.at) : null };
    case 'left':
    case 'retried':
      return { ...state, gesture: false, dueAt: state.dirty ? event.at : null };
    case 'saveStarted':
      return { ...state, saving: true, failed: false, dirty: false, dueAt: null };
    case 'saveSucceeded':
      return {
        ...state,
        saving: false,
        dueAt: state.dirty && !state.gesture ? (state.dueAt ?? quietAfter(event.at)) : null,
      };
    case 'saveFailed':
      return { ...state, saving: false, failed: true, dirty: true, dueAt: null };
    case 'replayed':
      return { ...state, saving: false, dirty: true, dueAt: event.at };
  }
};

export const saveIsDue = (state: AutosaveState, now: number): boolean =>
  state.dirty && !state.saving && state.dueAt !== null && now >= state.dueAt;

export const saveStatusOf = (state: AutosaveState): SaveStatus => {
  if (state.failed && !state.saving) {
    return 'failed';
  }

  return state.saving || state.dirty ? 'saving' : 'saved';
};

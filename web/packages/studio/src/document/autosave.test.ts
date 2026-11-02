import { describe, expect, it } from 'vitest';
import type { AutosaveEvent, AutosaveState, SaveStatus } from './autosave';
import {
  AUTOSAVE_IDLE,
  AUTOSAVE_QUIET_MS,
  autosaveAfter,
  saveIsDue,
  saveStatusOf,
} from './autosave';

const after = (events: readonly AutosaveEvent[]): AutosaveState =>
  events.reduce(autosaveAfter, AUTOSAVE_IDLE);

describe('autosave', () => {
  it.each<{
    name: string;
    events: AutosaveEvent[];
    now: number;
    due: boolean;
    status: SaveStatus;
  }>([
    { name: 'nothing changed', events: [], now: 5000, due: false, status: 'saved' },
    {
      name: 'waits for quiet after a change',
      events: [{ kind: 'changed', at: 0 }],
      now: AUTOSAVE_QUIET_MS - 1,
      due: false,
      status: 'saving',
    },
    {
      name: 'saves after quiet',
      events: [{ kind: 'changed', at: 0 }],
      now: AUTOSAVE_QUIET_MS,
      due: true,
      status: 'saving',
    },
    {
      name: 'holds back during a gesture',
      events: [{ kind: 'gestureStarted' }, { kind: 'changed', at: 0 }],
      now: 10_000,
      due: false,
      status: 'saving',
    },
    {
      name: 'counts the quiet from the gesture end',
      events: [
        { kind: 'gestureStarted' },
        { kind: 'changed', at: 0 },
        { kind: 'gestureEnded', at: 5000 },
      ],
      now: 5000 + AUTOSAVE_QUIET_MS,
      due: true,
      status: 'saving',
    },
    {
      name: 'saves at once on leave',
      events: [{ kind: 'gestureStarted' }, { kind: 'changed', at: 0 }, { kind: 'left', at: 100 }],
      now: 100,
      due: true,
      status: 'saving',
    },
    {
      name: 'is saved after a quiet save',
      events: [
        { kind: 'changed', at: 0 },
        { kind: 'saveStarted' },
        { kind: 'saveSucceeded', at: 900 },
      ],
      now: 10_000,
      due: false,
      status: 'saved',
    },
    {
      name: 'saves again for changes made while saving',
      events: [
        { kind: 'changed', at: 0 },
        { kind: 'saveStarted' },
        { kind: 'changed', at: 850 },
        { kind: 'saveSucceeded', at: 900 },
      ],
      now: 850 + AUTOSAVE_QUIET_MS,
      due: true,
      status: 'saving',
    },
    {
      name: 'never saves twice at once',
      events: [{ kind: 'changed', at: 0 }, { kind: 'saveStarted' }, { kind: 'left', at: 10 }],
      now: 10_000,
      due: false,
      status: 'saving',
    },
    {
      name: 'waits for a retry after a failure',
      events: [{ kind: 'changed', at: 0 }, { kind: 'saveStarted' }, { kind: 'saveFailed' }],
      now: 10_000,
      due: false,
      status: 'failed',
    },
    {
      name: 'retries at once',
      events: [
        { kind: 'changed', at: 0 },
        { kind: 'saveStarted' },
        { kind: 'saveFailed' },
        { kind: 'retried', at: 20 },
      ],
      now: 20,
      due: true,
      status: 'failed',
    },
    {
      name: 'saves the replayed changes at once',
      events: [{ kind: 'changed', at: 0 }, { kind: 'saveStarted' }, { kind: 'replayed', at: 300 }],
      now: 300,
      due: true,
      status: 'saving',
    },
  ])('$name', ({ events, now, due, status }) => {
    const state = after(events);

    expect([saveIsDue(state, now), saveStatusOf(state)]).toEqual([due, status]);
  });
});

import { describe, expect, it } from 'vitest';
import type { KkTrackState } from './timetable-track';
import { timetableTrackOf } from './timetable-track';

const MINUTE = 60_000;
const DUE_AT = 0.6;

describe('timetableTrackOf', () => {
  it.each<{
    label: string;
    lastRun: number | null;
    due: number | null;
    cadence: number | null;
    now: number;
    state: KkTrackState;
    cursor: number;
  }>([
    {
      label: 'runs on request only when there is no cadence',
      lastRun: 0,
      due: null,
      cadence: null,
      now: 5 * MINUTE,
      state: 'onDemand',
      cursor: 0,
    },
    {
      label: 'walks from the last run towards the due mark',
      lastRun: 0,
      due: 10 * MINUTE,
      cadence: 10 * MINUTE,
      now: 5 * MINUTE,
      state: 'onTime',
      cursor: 0.3,
    },
    {
      label: 'sits on the due mark exactly when the run is due',
      lastRun: 0,
      due: 10 * MINUTE,
      cadence: 10 * MINUTE,
      now: 10 * MINUTE,
      state: 'onTime',
      cursor: 0.6,
    },
    {
      label: 'counts lateness up to two cadences past due',
      lastRun: 0,
      due: 10 * MINUTE,
      cadence: 10 * MINUTE,
      now: 20 * MINUTE,
      state: 'late',
      cursor: 0.8,
    },
    {
      label: 'pins the cursor to the end once more than two cadences are missed',
      lastRun: 0,
      due: 10 * MINUTE,
      cadence: 10 * MINUTE,
      now: 31 * MINUTE,
      state: 'overdue',
      cursor: 1,
    },
    {
      label: 'measures from one cadence before due when it never ran',
      lastRun: null,
      due: 10 * MINUTE,
      cadence: 20 * MINUTE,
      now: 5 * MINUTE,
      state: 'onTime',
      cursor: 0.45,
    },
  ])('$label', ({ lastRun, due, cadence, now, state, cursor }) => {
    const track = timetableTrackOf(lastRun, due, cadence, now, DUE_AT);

    expect(track.state).toBe(state);
    expect(track.cursor).toBeCloseTo(cursor);
  });
});

export type KkTrackState = 'onDemand' | 'onTime' | 'late' | 'overdue';

export interface TimetableTrack {
  state: KkTrackState;
  cursor: number;
  due: number;
}

const LATE_CADENCES = 2;

const clampShare = (share: number): number => Math.min(Math.max(share, 0), 1);

export const timetableTrackOf = (
  lastRunMs: number | null,
  dueMs: number | null,
  cadenceMs: number | null,
  nowMs: number,
  dueAt: number,
): TimetableTrack => {
  if (dueMs === null || cadenceMs === null || cadenceMs <= 0) {
    return { state: 'onDemand', cursor: 0, due: dueAt };
  }

  const startMs = lastRunMs ?? dueMs - cadenceMs;
  const spanMs = dueMs > startMs ? dueMs - startMs : cadenceMs;

  if (nowMs <= dueMs) {
    const walked = clampShare((nowMs - startMs) / spanMs);

    return { state: 'onTime', cursor: dueAt * walked, due: dueAt };
  }

  const lateness = (nowMs - dueMs) / (cadenceMs * LATE_CADENCES);

  if (lateness > 1) {
    return { state: 'overdue', cursor: 1, due: dueAt };
  }

  return { state: 'late', cursor: dueAt + (1 - dueAt) * lateness, due: dueAt };
};

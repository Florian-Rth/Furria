import { describe, expect, it } from 'vitest';
import { hubActsOf } from './hub-acts';

const act = (actId: number, sessionYear: number, archived = false) => ({
  actId,
  name: `Tanz ${actId}`,
  kind: 'dance' as const,
  sessionYear,
  closed: sessionYear < 2026,
  archived,
  castSize: 10,
  viewerInCast: false,
});

describe('hubActsOf', () => {
  it('keeps this session’s standing acts and sums up the whole history', () => {
    const hub = hubActsOf({
      relevantSessionYear: 2026,
      acts: [act(1, 2027), act(2, 2026), act(3, 2026, true), act(4, 2024), act(5, 2021, true)],
    });

    expect({
      current: hub.current.map((entry) => entry.actId),
      recorded: hub.recorded,
      firstSessionYear: hub.firstSessionYear,
    }).toEqual({ current: [2], recorded: 3, firstSessionYear: 2024 });
  });

  it('has no first session before the group’s first act', () => {
    expect(hubActsOf({ relevantSessionYear: 2026, acts: [] }).firstSessionYear).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { hubActsOf } from './hub-acts';

const act = (actId: number, sessionYear: number) => ({
  actId,
  name: `Auftritt ${actId}`,
  kind: 'dance' as const,
  sessionYear,
  closed: sessionYear < 2026,
  viewerInCast: false,
});

describe('hubActsOf', () => {
  it('splits this session’s acts from earlier sessions, newest session first', () => {
    const hub = hubActsOf({
      relevantSessionYear: 2026,
      acts: [act(1, 2026), act(2, 2026), act(3, 2024), act(4, 2025), act(5, 2024)],
    });

    expect({
      current: hub.current.map((entry) => entry.actId),
      earlier: hub.earlier.map((session) => [
        session.sessionYear,
        session.acts.map((entry) => entry.actId),
      ]),
    }).toEqual({
      current: [1, 2],
      earlier: [
        [2025, [4]],
        [2024, [3, 5]],
      ],
    });
  });

  it('leaves this session empty when the group has only earlier acts', () => {
    expect(hubActsOf({ relevantSessionYear: 2026, acts: [act(3, 2025)] }).current).toEqual([]);
  });
});

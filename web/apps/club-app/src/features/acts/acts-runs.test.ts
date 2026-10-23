import { describe, expect, it } from 'vitest';
import { upcomingRunsOf } from './acts-runs';

describe('upcomingRunsOf', () => {
  it('counts per act only the evenings from today on', () => {
    const runs = upcomingRunsOf(
      [
        { eventId: 1, title: 'Vorbei', startsAt: '2026-10-22T19:00:00+00:00', actIds: [1, 2] },
        { eventId: 2, title: 'Heute', startsAt: '2026-10-23T06:00:00+00:00', actIds: [1] },
        { eventId: 3, title: 'Später', startsAt: '2027-01-23T19:11:00+00:00', actIds: [1, 3, 3] },
      ],
      new Date(2026, 9, 23, 12, 0),
    );

    expect(Object.fromEntries(runs)).toEqual({ 1: 2, 3: 1 });
  });
});

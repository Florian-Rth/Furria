import { describe, expect, it } from 'vitest';
import { toNextTrainingDraft } from './usual-training';

const TUESDAY_EVENING = {
  usualTrainingTimeId: 1,
  weekday: 'tuesday' as const,
  startsAt: '19:30:00',
  durationMinutes: 90,
  venueId: 4,
  venueName: 'Sporthalle',
};

const FRIDAY_AFTERNOON = {
  usualTrainingTimeId: 2,
  weekday: 'friday' as const,
  startsAt: '16:00:00',
  durationMinutes: 60,
  venueId: null,
  venueName: null,
};

describe('toNextTrainingDraft', () => {
  it.each([
    ['the Tuesday before the training', new Date(2026, 10, 3, 18, 0), '2026-11-03'],
    ['the Tuesday after the training started', new Date(2026, 10, 3, 19, 30), '2026-11-06'],
  ])('plans from the nearest usual time on %s', (_label, now, day) => {
    expect(toNextTrainingDraft(7, [FRIDAY_AFTERNOON, TUESDAY_EVENING], now).day).toBe(day);
  });

  it('plans today without a time when the group states no usual time', () => {
    expect(toNextTrainingDraft(7, [], new Date(2026, 10, 2, 12, 0))).toEqual({
      day: '2026-11-02',
      group: 7,
      kind: 'training',
    });
  });
});

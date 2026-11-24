import { describe, expect, it } from 'vitest';
import type { PurgeCountdown } from './bin-countdown';
import { purgeCountdownOf } from './bin-countdown';

describe('purgeCountdownOf', () => {
  const now = new Date('2026-10-09T12:00:00Z');

  it.each<[string, string, PurgeCountdown]>([
    ['part of a day counts as one', '2026-10-12T13:00:00Z', { daysLeft: 4, urgency: 'calm' }],
    ['three days left', '2026-10-12T12:00:00Z', { daysLeft: 3, urgency: 'urgent' }],
    ['already due', '2026-10-08T12:00:00Z', { daysLeft: 0, urgency: 'urgent' }],
  ])('%s', (_case, purgesAt, expected) => {
    expect(purgeCountdownOf(purgesAt, now)).toEqual(expected);
  });
});

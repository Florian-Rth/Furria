import { describe, expect, it } from 'vitest';
import type { AvailabilityState } from './events-labels';
import { toAvailabilityState } from './events-labels';
import type { EventDetails } from './schemas';

describe('toAvailabilityState', () => {
  it.each<[EventDetails['status'], AvailabilityState]>([
    ['presaleScheduled', 'beforePresale'],
    ['soldOut', 'settable'],
    ['cancelled', 'cancelled'],
  ])('lets a %s event %s', (status, expected) => {
    expect(toAvailabilityState({ status })).toBe(expected);
  });
});

import { describe, expect, it } from 'vitest';
import type { SalesStatus } from '@/lib/public-events/schemas';
import { isTicketRequestWindowOpen } from './ticket-request-window';

const now = new Date('2027-01-23T18:00:00Z');

describe('isTicketRequestWindowOpen', () => {
  it.each<[SalesStatus, string, boolean]>([
    ['available', '2027-01-23T19:11', true],
    ['fewLeft', '2027-01-23T19:11', true],
    ['soldOut', '2027-01-23T19:11', false],
    ['cancelled', '2027-01-23T19:11', false],
    ['presaleScheduled', '2027-01-23T19:11', false],
    ['announced', '2027-01-23T19:11', false],
    ['available', '2027-01-23T18:59', false],
    ['available', '2027-01-23T19:01', true],
  ])('takes requests for a %s evening starting %s: %s', (status, startsAt, open) => {
    expect(isTicketRequestWindowOpen({ status, startsAt }, now)).toBe(open);
  });
});

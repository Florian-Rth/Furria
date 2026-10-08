import { describe, expect, it } from 'vitest';
import type { SalesStatus } from '@/lib/public-events/schemas';
import { deriveSalesStatusLabel } from './sales-status-display';

type PresaleCase = [SalesStatus, string | null, string];

describe('deriveSalesStatusLabel', () => {
  it.each<PresaleCase>([
    ['presaleScheduled', '2027-01-10T10:00', 'Vorverkauf ab 10.01.2027'],
    ['presaleScheduled', null, 'Vorverkauf folgt'],
    ['announced', null, 'Vorverkauf folgt'],
  ])('dates the presale of a %s evening starting %s', (status, presaleStartsAt, label) => {
    expect(deriveSalesStatusLabel({ status, presaleStartsAt })).toBe(label);
  });
});

import { describe, expect, it } from 'vitest';
import { buildGreeting, formatStageDate } from './stage-greeting';

describe('buildGreeting', () => {
  it.each([
    { firstName: 'Anna', expected: 'MOIN, ANNA.' },
    { firstName: '  Björn  ', expected: 'MOIN, BJÖRN.' },
    { firstName: '', expected: 'MOIN.' },
    { firstName: '   ', expected: 'MOIN.' },
  ])('greets "$firstName" as $expected', ({ firstName, expected }) => {
    expect(buildGreeting(firstName)).toBe(expected);
  });
});

describe('formatStageDate', () => {
  it.each([
    { date: new Date(2026, 8, 8), expected: 'Dienstag, 8. September' },
    { date: new Date(2026, 0, 1), expected: 'Donnerstag, 1. Januar' },
  ])('formats $expected', ({ date, expected }) => {
    expect(formatStageDate(date)).toBe(expected);
  });
});

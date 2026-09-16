import { describe, expect, it } from 'vitest';
import { buildGreeting, formatStageDate } from './stage-greeting';

describe('buildGreeting', () => {
  it.each([
    { firstName: 'Anna', expected: 'Hallo, Anna.' },
    { firstName: '  Björn  ', expected: 'Hallo, Björn.' },
    { firstName: 'Weiß', expected: 'Hallo, Weiß.' },
    { firstName: '', expected: 'Hallo.' },
    { firstName: '   ', expected: 'Hallo.' },
  ])('greets "$firstName" as $expected', ({ firstName, expected }) => {
    expect(buildGreeting(firstName)).toBe(expected);
  });

  it('hands the name on exactly as the club spells it', () => {
    expect(buildGreeting('Karl-Heinz')).toContain('Karl-Heinz');
    expect(buildGreeting('Karl-Heinz')).not.toContain('KARL-HEINZ');
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

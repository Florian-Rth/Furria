import { describe, expect, it } from 'vitest';
import { sessionAt } from './club';

describe('sessionAt', () => {
  it('stays in the running session while the opening is still ahead', () => {
    expect(sessionAt(new Date(2026, 6, 21))).toEqual({
      startYear: 2025,
      yearsLabel: '2025/26',
    });
  });

  it('stays in the running session on the day before the opening', () => {
    expect(sessionAt(new Date(2026, 10, 10)).yearsLabel).toBe('2025/26');
  });

  it('switches to the new session on the opening day itself', () => {
    expect(sessionAt(new Date(2026, 10, 11))).toEqual({
      startYear: 2026,
      yearsLabel: '2026/27',
    });
  });

  it('keeps the session across the calendar year change', () => {
    expect(sessionAt(new Date(2027, 1, 14)).yearsLabel).toBe('2026/27');
  });

  it('pads the label across a century boundary', () => {
    expect(sessionAt(new Date(2099, 11, 31)).yearsLabel).toBe('2099/00');
  });
});

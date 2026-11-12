import { describe, expect, it } from 'vitest';
import { calendarMentionLineOf, mentionDayOf, mentionMomentOf } from './mention-lines';

const SATURDAY_EVENING = new Date(2026, 10, 14, 19, 30).toISOString();

describe('mentionMomentOf', () => {
  it('names the weekday, day and local time', () => {
    expect(mentionMomentOf(SATURDAY_EVENING)).toBe('Sa, 14. Nov. 2026 · 19:30');
  });
});

describe('mentionDayOf', () => {
  it('names the local day in full', () => {
    expect(mentionDayOf(new Date(2026, 10, 11, 0, 30).toISOString())).toBe('11. November 2026');
  });
});

describe('calendarMentionLineOf', () => {
  it.each([
    [false, 'Sa, 14. Nov. 2026 · 19:30'],
    [true, 'Sa, 14. Nov. 2026 · 19:30 · abgesagt'],
  ])('adds the cancellation when cancelled is %s', (isCancelled, line) => {
    expect(calendarMentionLineOf(SATURDAY_EVENING, isCancelled)).toBe(line);
  });
});

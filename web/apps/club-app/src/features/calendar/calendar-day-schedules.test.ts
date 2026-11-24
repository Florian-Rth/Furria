import { describe, expect, it } from 'vitest';
import type { CalendarDayScheduleIssueCode } from './calendar-day-schedules';
import { toDayScheduleIssues, toDaySpan } from './calendar-day-schedules';
import type { CalendarAddOnCardForm, CalendarDayScheduleForm } from './schemas';

const schedule = (
  steps: { day: number; time: string; text: string }[],
  title = '',
): CalendarDayScheduleForm => ({
  dayScheduleId: null,
  title,
  steps: steps.map((step, index) => ({ key: `s${index}`, stepId: null, ...step })),
});

const card = (daySchedule: CalendarDayScheduleForm): CalendarAddOnCardForm => ({
  key: 'plan',
  kind: 'daySchedule',
  daySchedule,
});

describe('toDaySpan', () => {
  it.each([
    ['2026-12-31', '2027-01-01', 2],
    ['2026-03-28', '2026-03-30', 3],
    ['2026-11-22', '2026-11-20', 1],
  ])('spans %s to %s over %i days', (startDay, endDay, expected) => {
    expect(toDaySpan({ startDay, endDay })).toBe(expected);
  });
});

describe('toDayScheduleIssues', () => {
  const days = { startDay: '2026-11-20', endDay: '2026-11-21' };

  it.each<[CalendarDayScheduleForm, [CalendarDayScheduleIssueCode, (string | number)[]][]]>([
    [
      schedule([{ day: 2, time: '', text: '  ' }]),
      [
        ['stepDayOutside', ['addOns', 0, 'daySchedule', 'steps', 0, 'day']],
        ['stepTimeMissing', ['addOns', 0, 'daySchedule', 'steps', 0, 'time']],
        ['stepTextMissing', ['addOns', 0, 'daySchedule', 'steps', 0, 'text']],
      ],
    ],
  ])('finds the issues of %j', (form, expected) => {
    const issues = toDayScheduleIssues([card(form)], days);

    expect(issues.map((issue) => [issue.code, issue.path])).toEqual(expected);
  });

  it('refuses the second day once the entry ends on its first day', () => {
    const form = schedule([{ day: 1, time: '10:00', text: 'Rückfahrt' }]);
    const issues = toDayScheduleIssues([card(form)], { startDay: '2026-11-20', endDay: '' });

    expect(issues.map((issue) => issue.code)).toEqual(['stepDayOutside']);
  });
});

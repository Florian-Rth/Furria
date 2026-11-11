import { describe, expect, it } from 'vitest';
import type { CalendarDayScheduleIssueCode } from './calendar-day-schedules';
import {
  DAY_SCHEDULE_MAX_STEPS,
  hasDayChoice,
  toDayScheduleIssues,
  toDaySchedulePayload,
  toDaySpan,
  toScheduleView,
  withAddedStep,
  withChangedStep,
} from './calendar-day-schedules';
import type {
  CalendarAddOnCardForm,
  CalendarDayScheduleForm,
  CalendarDayScheduleStep,
} from './schemas';

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

const step = (stepId: number, day: number, time: string): CalendarDayScheduleStep => ({
  stepId,
  day,
  time,
  text: `Schritt ${stepId}`,
});

describe('toDaySpan', () => {
  it.each([
    ['2026-11-20', '', 1],
    ['2026-11-20', '2026-11-20', 1],
    ['2026-11-20', '2026-11-22', 3],
    ['2026-12-31', '2027-01-01', 2],
    ['2026-03-28', '2026-03-30', 3],
    ['2026-11-22', '2026-11-20', 1],
    ['', '', 1],
    ['', '2026-11-22', 1],
  ])('spans %s to %s over %i days', (startDay, endDay, expected) => {
    expect(toDaySpan({ startDay, endDay })).toBe(expected);
  });
});

describe('hasDayChoice', () => {
  it.each([
    [[{ day: 0, time: '10:00', text: 'A' }], 1, false],
    [[{ day: 0, time: '10:00', text: 'A' }], 2, true],
    [[{ day: 1, time: '10:00', text: 'A' }], 1, true],
  ])('offers a day for %j over %i days: %s', (steps, span, expected) => {
    expect(hasDayChoice(schedule(steps), span)).toBe(expected);
  });
});

describe('toDayScheduleIssues', () => {
  const days = { startDay: '2026-11-20', endDay: '2026-11-21' };

  it.each<[CalendarDayScheduleForm, [CalendarDayScheduleIssueCode, (string | number)[]][]]>([
    [schedule([{ day: 1, time: '10:00', text: 'Rückfahrt' }]), []],
    [schedule([], 'Ablauf'), [['stepsMissing', ['addOns', 0, 'daySchedule', 'steps']]]],
    [
      schedule([{ day: 0, time: '10:00', text: 'A' }], 'x'.repeat(121)),
      [['titleTooLong', ['addOns', 0, 'daySchedule', 'title']]],
    ],
    [
      schedule([{ day: 2, time: '', text: '  ' }]),
      [
        ['stepDayOutside', ['addOns', 0, 'daySchedule', 'steps', 0, 'day']],
        ['stepTimeMissing', ['addOns', 0, 'daySchedule', 'steps', 0, 'time']],
        ['stepTextMissing', ['addOns', 0, 'daySchedule', 'steps', 0, 'text']],
      ],
    ],
    [
      schedule([
        { day: 0, time: '10:00', text: 'A' },
        { day: 0, time: '11:00', text: 'x'.repeat(121) },
      ]),
      [['stepTextTooLong', ['addOns', 0, 'daySchedule', 'steps', 1, 'text']]],
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

describe('toDaySchedulePayload', () => {
  it.each([
    ['  Hinfahrt ', 'Hinfahrt'],
    ['   ', null],
  ])('sends the title %j as %j with trimmed steps', (title, expected) => {
    const form = schedule([{ day: 1, time: '09:30', text: ' Frühstück ' }], title);

    expect(toDaySchedulePayload(form)).toEqual({
      dayScheduleId: null,
      title: expected,
      steps: [{ stepId: null, day: 1, time: '09:30', text: 'Frühstück' }],
    });
  });
});

describe('withAddedStep', () => {
  it.each([
    [[], { key: 'new', stepId: null, day: 0, time: '19:00', text: '' }],
    [
      [{ day: 1, time: '08:15', text: 'Frühstück' }],
      { key: 'new', stepId: null, day: 1, time: '08:15', text: '' },
    ],
  ])('adds after %j the step %j', (steps, expected) => {
    expect(withAddedStep(schedule(steps), 'new', '19:00').steps.at(-1)).toEqual(expected);
  });

  it('adds nothing once the schedule holds the most steps', () => {
    const full = schedule(
      Array.from({ length: DAY_SCHEDULE_MAX_STEPS }, () => ({ day: 0, time: '10:00', text: 'A' })),
    );

    expect(withAddedStep(full, 'new', '19:00').steps).toHaveLength(DAY_SCHEDULE_MAX_STEPS);
  });
});

describe('withChangedStep', () => {
  it('changes only the step under the key', () => {
    const form = schedule([
      { day: 0, time: '10:00', text: 'A' },
      { day: 0, time: '11:00', text: 'B' },
    ]);

    expect(withChangedStep(form, 's1', { time: '12:30' }).steps.map((held) => held.time)).toEqual([
      '10:00',
      '12:30',
    ]);
  });
});

describe('toScheduleView', () => {
  const steps = [step(1, 0, '08:00'), step(2, 0, '20:00'), step(3, 1, '09:00')];

  it('groups the steps by day and shows the days when the entry spans several', () => {
    const view = toScheduleView(steps, '2026-11-20T11:00:00Z', '2026-11-21T11:00:00Z');

    expect([
      view.showsDays,
      view.days.map((day) => [day.day, day.isoDay, day.steps.map((held) => held.stepId)]),
    ]).toEqual([
      true,
      [
        [0, '2026-11-20', [1, 2]],
        [1, '2026-11-21', [3]],
      ],
    ]);
  });

  it.each([
    [[step(1, 0, '08:00')], null, false],
    [[step(1, 1, '08:00')], null, true],
  ])('shows days for %j ending %s: %s', (held, endsAt, expected) => {
    expect(toScheduleView(held, '2026-11-20T11:00:00Z', endsAt).showsDays).toBe(expected);
  });
});

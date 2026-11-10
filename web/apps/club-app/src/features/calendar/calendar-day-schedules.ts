import { toLocalIsoDay } from '@/lib/calendar-days';
import { daysBetween, shiftDay } from '@/lib/day';
import type {
  CalendarAddOnCardForm,
  CalendarDaySchedule,
  CalendarDayScheduleForm,
  CalendarDayScheduleStep,
  CalendarDayScheduleStepForm,
} from './schemas';

export const DAY_SCHEDULE_TITLE_MAX_LENGTH = 120;
export const DAY_SCHEDULE_STEP_TEXT_MAX_LENGTH = 120;
export const DAY_SCHEDULE_MAX_STEPS = 50;

const ISO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type CalendarDayScheduleIssueCode =
  | 'titleTooLong'
  | 'stepsMissing'
  | 'stepTimeMissing'
  | 'stepTextMissing'
  | 'stepTextTooLong'
  | 'stepDayOutside';

export interface CalendarDayScheduleIssue {
  code: CalendarDayScheduleIssueCode;
  path: (string | number)[];
}

export type DayScheduleFieldPath =
  | `addOns.${number}.daySchedule.title`
  | `addOns.${number}.daySchedule.steps`
  | `addOns.${number}.daySchedule.steps.${number}.day`
  | `addOns.${number}.daySchedule.steps.${number}.time`
  | `addOns.${number}.daySchedule.steps.${number}.text`;

export interface CalendarEntryDays {
  startDay: string;
  endDay: string;
}

export const isIsoDay = (value: string): boolean => ISO_DAY_PATTERN.test(value);

export const toDaySpan = ({ startDay, endDay }: CalendarEntryDays): number => {
  const lastDay = endDay === '' ? startDay : endDay;

  if (!isIsoDay(startDay) || !isIsoDay(lastDay)) {
    return 1;
  }

  return Math.max(daysBetween(startDay, lastDay), 0) + 1;
};

export const hasDayChoice = (schedule: CalendarDayScheduleForm, span: number): boolean =>
  span > 1 || schedule.steps.some((step) => step.day > 0);

const toTitleIssues = (schedule: CalendarDayScheduleForm): CalendarDayScheduleIssueCode[] =>
  schedule.title.trim().length > DAY_SCHEDULE_TITLE_MAX_LENGTH ? ['titleTooLong'] : [];

const toTextIssues = (step: CalendarDayScheduleStepForm): CalendarDayScheduleIssueCode[] => {
  const text = step.text.trim();

  if (text === '') {
    return ['stepTextMissing'];
  }

  return text.length > DAY_SCHEDULE_STEP_TEXT_MAX_LENGTH ? ['stepTextTooLong'] : [];
};

const toStepIssues = (
  step: CalendarDayScheduleStepForm,
  stepPath: (string | number)[],
  span: number,
): CalendarDayScheduleIssue[] => [
  ...(step.day >= span ? [{ code: 'stepDayOutside' as const, path: [...stepPath, 'day'] }] : []),
  ...(step.time === '' ? [{ code: 'stepTimeMissing' as const, path: [...stepPath, 'time'] }] : []),
  ...toTextIssues(step).map((code) => ({ code, path: [...stepPath, 'text'] })),
];

const toCardIssues = (
  schedule: CalendarDayScheduleForm,
  cardIndex: number,
  span: number,
): CalendarDayScheduleIssue[] => {
  const schedulePath = ['addOns', cardIndex, 'daySchedule'];

  return [
    ...toTitleIssues(schedule).map((code) => ({ code, path: [...schedulePath, 'title'] })),
    ...(schedule.steps.length === 0
      ? [{ code: 'stepsMissing' as const, path: [...schedulePath, 'steps'] }]
      : []),
    ...schedule.steps.flatMap((step, stepIndex) =>
      toStepIssues(step, [...schedulePath, 'steps', stepIndex], span),
    ),
  ];
};

export const toDayScheduleIssues = (
  cards: readonly CalendarAddOnCardForm[],
  days: CalendarEntryDays,
): CalendarDayScheduleIssue[] => {
  const span = toDaySpan(days);

  return cards.flatMap((card, cardIndex) =>
    card.kind === 'daySchedule' ? toCardIssues(card.daySchedule, cardIndex, span) : [],
  );
};

export type CalendarDayScheduleStepPayload = {
  stepId: number | null;
  day: number;
  time: string;
  text: string;
};

export type CalendarDaySchedulePayload = {
  dayScheduleId: number | null;
  title: string | null;
  steps: CalendarDayScheduleStepPayload[];
};

export const toDaySchedulePayload = (
  schedule: CalendarDayScheduleForm,
): CalendarDaySchedulePayload => {
  const title = schedule.title.trim();

  return {
    dayScheduleId: schedule.dayScheduleId,
    title: title === '' ? null : title,
    steps: schedule.steps.map((step) => ({
      stepId: step.stepId,
      day: step.day,
      time: step.time,
      text: step.text.trim(),
    })),
  };
};

export const toDayScheduleForm = (
  schedule: CalendarDaySchedule,
  nextKey: () => string,
): CalendarDayScheduleForm => ({
  dayScheduleId: schedule.dayScheduleId,
  title: schedule.title ?? '',
  steps: schedule.steps.map((step) => ({
    key: nextKey(),
    stepId: step.stepId,
    day: step.day,
    time: step.time,
    text: step.text,
  })),
});

export const toNewDayScheduleForm = (
  stepKey: string,
  startTime: string,
): CalendarDayScheduleForm => ({
  dayScheduleId: null,
  title: '',
  steps: [{ key: stepKey, stepId: null, day: 0, time: startTime, text: '' }],
});

export const canAddStep = (schedule: CalendarDayScheduleForm): boolean =>
  schedule.steps.length < DAY_SCHEDULE_MAX_STEPS;

export const withAddedStep = (
  schedule: CalendarDayScheduleForm,
  stepKey: string,
  fallbackTime: string,
): CalendarDayScheduleForm => {
  if (!canAddStep(schedule)) {
    return schedule;
  }

  const last = schedule.steps.at(-1);

  return {
    ...schedule,
    steps: [
      ...schedule.steps,
      {
        key: stepKey,
        stepId: null,
        day: last?.day ?? 0,
        time: last?.time ?? fallbackTime,
        text: '',
      },
    ],
  };
};

export const withoutStep = (
  schedule: CalendarDayScheduleForm,
  stepKey: string,
): CalendarDayScheduleForm => ({
  ...schedule,
  steps: schedule.steps.filter((step) => step.key !== stepKey),
});

export const withChangedStep = (
  schedule: CalendarDayScheduleForm,
  stepKey: string,
  change: Partial<Pick<CalendarDayScheduleStepForm, 'day' | 'time' | 'text'>>,
): CalendarDayScheduleForm => ({
  ...schedule,
  steps: schedule.steps.map((step) => (step.key === stepKey ? { ...step, ...change } : step)),
});

export interface CalendarScheduleDay {
  day: number;
  isoDay: string;
  steps: CalendarDayScheduleStep[];
}

export const toScheduleDayGroups = (
  steps: readonly CalendarDayScheduleStep[],
  startDay: string,
): CalendarScheduleDay[] =>
  [...new Set(steps.map((step) => step.day))].map((day) => ({
    day,
    isoDay: shiftDay(startDay, day),
    steps: steps.filter((step) => step.day === day),
  }));

export const toStepDayPaths = (cards: readonly CalendarAddOnCardForm[]): DayScheduleFieldPath[] =>
  cards.flatMap((card, cardIndex) =>
    card.kind === 'daySchedule'
      ? card.daySchedule.steps.map(
          (_, stepIndex) => `addOns.${cardIndex}.daySchedule.steps.${stepIndex}.day` as const,
        )
      : [],
  );

export interface CalendarScheduleView {
  showsDays: boolean;
  days: CalendarScheduleDay[];
}

export const toScheduleView = (
  steps: readonly CalendarDayScheduleStep[],
  startsAt: string,
  endsAt: string | null,
): CalendarScheduleView => {
  const startDay = toLocalIsoDay(startsAt);
  const span = toDaySpan({ startDay, endDay: endsAt === null ? '' : toLocalIsoDay(endsAt) });
  const days = toScheduleDayGroups(steps, startDay);

  return { showsDays: span > 1 || days.some((day) => day.day > 0), days };
};

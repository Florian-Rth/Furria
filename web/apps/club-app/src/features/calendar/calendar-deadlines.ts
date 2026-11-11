import { toDayTime, toInstant } from '@/lib/day';
import type { CalendarAddOnCardForm } from './schemas';

export const NO_DEADLINE = '';
export const NO_START = '';

export type CalendarDeadlineIssueCode = 'deadlineTimeMissing' | 'deadlineAfterStart';

export interface CalendarDeadlineStart {
  day: string;
  time: string;
}

export interface CalendarDeadlineFields {
  day: string;
  time: string;
  held: string | null;
}

export type CalendarDeadlinePath =
  | `addOns.${number}.poll.votesUntilTime`
  | `addOns.${number}.signUpList.signUpUntilTime`;

export const toDeadlineIssue = (
  deadline: Pick<CalendarDeadlineFields, 'day' | 'time'>,
  start: CalendarDeadlineStart,
): CalendarDeadlineIssueCode | null => {
  if (deadline.day === NO_DEADLINE) {
    return null;
  }
  if (deadline.time === NO_DEADLINE) {
    return 'deadlineTimeMissing';
  }
  if (start.day === NO_START || start.time === NO_START) {
    return null;
  }

  return `${deadline.day}T${deadline.time}` > `${start.day}T${start.time}`
    ? 'deadlineAfterStart'
    : null;
};

export const toDeadlineIssueCodes = (
  deadline: Pick<CalendarDeadlineFields, 'day' | 'time'>,
  start: CalendarDeadlineStart,
): CalendarDeadlineIssueCode[] => {
  const code = toDeadlineIssue(deadline, start);

  return code === null ? [] : [code];
};

export const hasNoDeadline = (day: string): boolean => day === NO_DEADLINE;

export const toDeadlineInstant = (deadline: CalendarDeadlineFields): string | null => {
  if (deadline.day === NO_DEADLINE) {
    return null;
  }

  const held = deadline.held === null ? null : toDayTime(deadline.held);
  const isUnchanged = held?.day === deadline.day && held.time === deadline.time;

  return isUnchanged ? deadline.held : toInstant(deadline.day, deadline.time);
};

export const toDeadlineFields = (instant: string | null): CalendarDeadlineFields => {
  const deadline = instant === null ? null : toDayTime(instant);

  return {
    day: deadline?.day ?? NO_DEADLINE,
    time: deadline?.time ?? NO_DEADLINE,
    held: instant,
  };
};

export const toDeadlineDayChange = (
  current: Pick<CalendarDeadlineFields, 'time'>,
  day: string | null,
  fallbackTime: string,
): Pick<CalendarDeadlineFields, 'day' | 'time'> => {
  if (day === null || day === NO_DEADLINE) {
    return { day: NO_DEADLINE, time: NO_DEADLINE };
  }

  return { day, time: current.time === NO_DEADLINE ? fallbackTime : current.time };
};

const toCardDeadlinePath = (
  card: CalendarAddOnCardForm,
  cardIndex: number,
): CalendarDeadlinePath | null => {
  switch (card.kind) {
    case 'poll':
      return hasNoDeadline(card.poll.votesUntilDay)
        ? null
        : `addOns.${cardIndex}.poll.votesUntilTime`;
    case 'signUpList':
      return hasNoDeadline(card.signUpList.signUpUntilDay)
        ? null
        : `addOns.${cardIndex}.signUpList.signUpUntilTime`;
    default:
      return null;
  }
};

export const toDeadlinePaths = (cards: readonly CalendarAddOnCardForm[]): CalendarDeadlinePath[] =>
  cards.flatMap((card, cardIndex) => {
    const path = toCardDeadlinePath(card, cardIndex);

    return path === null ? [] : [path];
  });

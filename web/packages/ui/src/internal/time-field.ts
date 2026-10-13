import type { KkFieldChoice } from './field-choice';
import { EMPTY_CHOICE_ID } from './field-choice';

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const PAD_LENGTH = 2;
const PAD_DIGIT = '0';

const toTwoDigits = (value: number): string => String(value).padStart(PAD_LENGTH, PAD_DIGIT);

export const parseClockTime = (value: string): Date | null => {
  const match = CLOCK_TIME_PATTERN.exec(value);

  if (match === null) {
    return null;
  }

  const time = new Date(0);
  time.setHours(Number(match[1]), Number(match[2]), 0, 0);

  return time;
};

export const toClockTime = (value: Date | null): string | null => {
  if (value === null || Number.isNaN(value.getTime())) {
    return null;
  }

  return `${toTwoDigits(value.getHours())}:${toTwoDigits(value.getMinutes())}`;
};

export const buildTimeChoices = (
  quickTimes: readonly string[],
  emptyLabel: string | null,
): readonly KkFieldChoice[] => {
  const emptyChoices: KkFieldChoice[] =
    emptyLabel === null ? [] : [{ id: EMPTY_CHOICE_ID, label: emptyLabel }];
  const timeChoices = quickTimes
    .filter((time, index) => CLOCK_TIME_PATTERN.test(time) && quickTimes.indexOf(time) === index)
    .map((time) => ({ id: time, label: time }));

  return [...emptyChoices, ...timeChoices];
};

import type { KkFieldChoice } from './field-choice';
import { EMPTY_CHOICE_ID } from './field-choice';

const CENTURY = 100;
const FOLLOWING_YEAR_DIGITS = 2;
const SESSION_YEAR_PATTERN = /^\d{4}$/;

export const SESSION_YEAR_LENGTH = 4;

export interface KkSessionInput {
  isPublishable: boolean;
  year: number | null;
}

export const formatSessionYear = (year: number): string => {
  const followingYear = (year + 1) % CENTURY;

  return `${year}/${String(followingYear).padStart(FOLLOWING_YEAR_DIGITS, '0')}`;
};

export const sessionChoiceId = (year: number | null): string =>
  year === null ? EMPTY_CHOICE_ID : String(year);

export const resolveSessionChoiceId = (id: string): number | null => {
  if (id === EMPTY_CHOICE_ID) {
    return null;
  }

  return Number(id);
};

export const sessionYearToInput = (year: number | null): string =>
  year === null ? '' : String(year);

export const readSessionInput = (text: string, allowOpen: boolean): KkSessionInput => {
  const trimmed = text.trim();

  if (trimmed === '') {
    return { isPublishable: allowOpen, year: null };
  }

  if (!SESSION_YEAR_PATTERN.test(trimmed)) {
    return { isPublishable: false, year: null };
  }

  return { isPublishable: true, year: Number(trimmed) };
};

export const buildSessionChoices = (
  currentSessionYear: number,
  openLabel: string | null,
): readonly KkFieldChoice[] => {
  const choices: KkFieldChoice[] =
    openLabel === null ? [] : [{ id: EMPTY_CHOICE_ID, label: openLabel }];
  const nextSessionYear = currentSessionYear + 1;

  choices.push({
    id: sessionChoiceId(currentSessionYear),
    label: formatSessionYear(currentSessionYear),
  });
  choices.push({ id: sessionChoiceId(nextSessionYear), label: formatSessionYear(nextSessionYear) });

  return choices;
};

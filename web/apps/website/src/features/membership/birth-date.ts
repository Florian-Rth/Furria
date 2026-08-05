import { MAX_PLAUSIBLE_AGE, parseBirthDate } from './membership-derivation';

export interface BirthDateBounds {
  minDate: Date;
  maxDate: Date;
}

const padded = (value: number): string => String(value).padStart(2, '0');

export const formatBirthDateValue = (date: Date | null): string => {
  if (date === null || Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${padded(date.getMonth() + 1)}-${padded(date.getDate())}`;
};

export const parseBirthDateValue = (value: string): Date | null => parseBirthDate(value);

export const buildBirthDateBounds = (today: Date): BirthDateBounds => ({
  minDate: new Date(today.getFullYear() - MAX_PLAUSIBLE_AGE, today.getMonth(), today.getDate()),
  maxDate: today,
});

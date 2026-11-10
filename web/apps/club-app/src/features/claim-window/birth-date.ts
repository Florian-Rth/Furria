const YEAR_DIGITS = 4;

const toWhole = (typed: string): number | null => {
  const trimmed = typed.trim();

  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
};

const twoDigits = (value: number): string => String(value).padStart(2, '0');

export const birthDateOf = (day: string, month: string, year: string): string | null => {
  const dayNumber = toWhole(day);
  const monthNumber = toWhole(month);
  const yearNumber = toWhole(year);

  if (dayNumber === null || monthNumber === null || yearNumber === null) {
    return null;
  }
  if (year.trim().length !== YEAR_DIGITS) {
    return null;
  }

  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));
  const isReal =
    date.getUTCFullYear() === yearNumber &&
    date.getUTCMonth() === monthNumber - 1 &&
    date.getUTCDate() === dayNumber;

  return isReal ? `${yearNumber}-${twoDigits(monthNumber)}-${twoDigits(dayNumber)}` : null;
};

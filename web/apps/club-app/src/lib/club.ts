export const FOUNDING_YEAR = 1971;

export const SESSION_OPENING_MONTH = 11;
export const SESSION_OPENING_DAY = 11;

export interface Session {
  number: number;
  startYear: number;
  yearsLabel: string;
}

export const sessionAt = (date: Date): Session => {
  const month = date.getMonth() + 1;
  const openingHasPassed =
    month > SESSION_OPENING_MONTH ||
    (month === SESSION_OPENING_MONTH && date.getDate() >= SESSION_OPENING_DAY);
  const startYear = openingHasPassed ? date.getFullYear() : date.getFullYear() - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return {
    number: startYear - FOUNDING_YEAR + 1,
    startYear,
    yearsLabel: `${startYear}/${endYearShort}`,
  };
};

export const currentSessionYear = (): number => sessionAt(new Date()).startYear;

const ASH_WEDNESDAY_OFFSET = 46;

const easterSundayOf = (year: number): Date => {
  const metonic = year % 19;
  const century = Math.floor(year / 100);
  const yearInCentury = year % 100;
  const leapCenturies = Math.floor(century / 4);
  const centuryRest = century % 4;
  const lunarShift = Math.floor((century + 8) / 25);
  const lunarCorrection = Math.floor((century - lunarShift + 1) / 3);
  const epact = (19 * metonic + century - leapCenturies - lunarCorrection + 15) % 30;
  const leapYears = Math.floor(yearInCentury / 4);
  const yearRest = yearInCentury % 4;
  const weekday = (32 + 2 * centuryRest + 2 * leapYears - epact - yearRest) % 7;
  const correction = Math.floor((metonic + 11 * epact + 22 * weekday) / 451);
  const dayOfMarch = epact + weekday - 7 * correction + 114;

  return new Date(year, Math.floor(dayOfMarch / 31) - 1, (dayOfMarch % 31) + 1);
};

export const ashWednesdayOf = (year: number): Date => {
  const easter = easterSundayOf(year);

  return new Date(year, easter.getMonth(), easter.getDate() - ASH_WEDNESDAY_OFFSET);
};

export const sessionProgressAt = (date: Date): number | null => {
  const { startYear } = sessionAt(date);
  const opening = new Date(startYear, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY);
  const ashWednesday = ashWednesdayOf(startYear + 1);
  const closing = new Date(
    ashWednesday.getFullYear(),
    ashWednesday.getMonth(),
    ashWednesday.getDate() + 1,
  );

  if (date >= closing) {
    return null;
  }

  return Math.min(
    (date.getTime() - opening.getTime()) / (closing.getTime() - opening.getTime()),
    1,
  );
};

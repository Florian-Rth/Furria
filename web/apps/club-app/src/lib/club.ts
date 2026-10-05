import type { KkMottoStageState } from '@furria/ui';

export const SESSION_OPENING_MONTH = 11;
export const SESSION_OPENING_DAY = 11;
export const SESSION_OPENING_HOUR = 11;
export const SESSION_OPENING_MINUTE = 11;

const MS_PER_DAY = 86_400_000;

export interface Session {
  startYear: number;
  yearsLabel: string;
}

export const sessionYearsLabelOf = (startYear: number): string =>
  `${startYear}/${String((startYear + 1) % 100).padStart(2, '0')}`;

export const sessionAt = (date: Date): Session => {
  const month = date.getMonth() + 1;
  const openingHasPassed =
    month > SESSION_OPENING_MONTH ||
    (month === SESSION_OPENING_MONTH && date.getDate() >= SESSION_OPENING_DAY);
  const startYear = openingHasPassed ? date.getFullYear() : date.getFullYear() - 1;
  return {
    startYear,
    yearsLabel: sessionYearsLabelOf(startYear),
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

export const sessionOpeningAt = (startYear: number): Date =>
  new Date(
    startYear,
    SESSION_OPENING_MONTH - 1,
    SESSION_OPENING_DAY,
    SESSION_OPENING_HOUR,
    SESSION_OPENING_MINUTE,
  );

export const sessionClosingAt = (startYear: number): Date => {
  const ashWednesday = ashWednesdayOf(startYear + 1);

  return new Date(ashWednesday.getFullYear(), ashWednesday.getMonth(), ashWednesday.getDate() + 1);
};

export const isBetweenSessions = (date: Date): boolean =>
  date >= sessionClosingAt(sessionAt(date).startYear);

export const relevantSessionYear = (date: Date): number =>
  isBetweenSessions(date) ? sessionAt(date).startYear + 1 : sessionAt(date).startYear;

export const mottoStageStateAt = (
  date: Date,
  relevantStartYear: number,
  mottoIsKnown: boolean,
): KkMottoStageState => {
  if (date >= sessionOpeningAt(relevantStartYear) && date < sessionClosingAt(relevantStartYear)) {
    return 'running';
  }

  return mottoIsKnown ? 'teaser' : 'resting';
};

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const calendarDaysBetween = (from: Date, to: Date): number =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);

export const daysUntilOpening = (date: Date, relevantStartYear: number): number =>
  calendarDaysBetween(date, sessionOpeningAt(relevantStartYear));

export interface CarnivalDays {
  womensCarnivalDay: Date;
  roseMonday: Date;
  carnivalTuesday: Date;
  ashWednesday: Date;
}

const WOMENS_CARNIVAL_DAY_LEAD = 6;
const ROSE_MONDAY_LEAD = 2;
const CARNIVAL_TUESDAY_LEAD = 1;

const daysBefore = (day: Date, lead: number): Date =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate() - lead);

export const carnivalDaysOf = (startYear: number): CarnivalDays => {
  const ashWednesday = ashWednesdayOf(startYear + 1);

  return {
    womensCarnivalDay: daysBefore(ashWednesday, WOMENS_CARNIVAL_DAY_LEAD),
    roseMonday: daysBefore(ashWednesday, ROSE_MONDAY_LEAD),
    carnivalTuesday: daysBefore(ashWednesday, CARNIVAL_TUESDAY_LEAD),
    ashWednesday,
  };
};

export const sessionDayOf = (date: Date): number | null => {
  if (isBetweenSessions(date)) {
    return null;
  }

  return calendarDaysBetween(sessionOpeningAt(sessionAt(date).startYear), date) + 1;
};

import type { IsoDay } from './seed-time.ts';
import { addDays } from './seed-time.ts';

const ASH_WEDNESDAY_BEFORE_EASTER_DAYS = 46;
const DAYS_PER_WEEK = 7;

const isoDayOf = (year: number, month: number, date: number): IsoDay =>
  new Date(Date.UTC(year, month - 1, date)).toISOString().slice(0, 10);

export const easterSundayOf = (year: number): IsoDay => {
  const golden = year % 19;
  const century = Math.floor(year / 100);
  const yearOfCentury = year % 100;
  const leapCenturies = Math.floor(century / 4);
  const centuryRest = century % 4;
  const lunarCorrection = Math.floor((century + 8) / 25);
  const solarCorrection = Math.floor((century - lunarCorrection + 1) / 3);
  const epact = (19 * golden + century - leapCenturies - solarCorrection + 15) % 30;
  const leapYears = Math.floor(yearOfCentury / 4);
  const yearRest = yearOfCentury % 4;
  const weekdayShift = (32 + 2 * centuryRest + 2 * leapYears - epact - yearRest) % 7;
  const lateCorrection = Math.floor((golden + 11 * epact + 22 * weekdayShift) / 451);
  const daysFromMarch = epact + weekdayShift - 7 * lateCorrection + 114;
  return isoDayOf(year, Math.floor(daysFromMarch / 31), (daysFromMarch % 31) + 1);
};

export const ashWednesdayOf = (year: number): IsoDay =>
  addDays(easterSundayOf(year), -ASH_WEDNESDAY_BEFORE_EASTER_DAYS);

export const sessionYearOf = (today: IsoDay): number => {
  const year = Number(today.slice(0, 4));
  return today <= ashWednesdayOf(year) ? year - 1 : year;
};

export const nthWeekdayOf = (year: number, month: number, weekday: number, nth: number): IsoDay => {
  const first = isoDayOf(year, month, 1);
  const firstWeekday = new Date(`${first}T00:00:00Z`).getUTCDay();
  const offset = (weekday - firstWeekday + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  return addDays(first, offset + (nth - 1) * DAYS_PER_WEEK);
};

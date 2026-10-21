import { daysBetween, mondayOf, monthDaysOf, monthStartOf, shiftDay } from './calendar-agenda';

const DAYS_IN_WEEK = 7;
const THURSDAY = 3;

export interface CalendarFoldSpot {
  month: string;
  row: number;
}

export const gridRowsOf = (month: string): number => monthDaysOf(month).length / DAYS_IN_WEEK;

export const weekSpotOf = (isoDay: string): CalendarFoldSpot => {
  const monday = mondayOf(isoDay);
  const month = monthStartOf(shiftDay(monday, THURSDAY));

  return { month, row: daysBetween(mondayOf(month), monday) / DAYS_IN_WEEK };
};

export const rowOfDayIn = (month: string, isoDay: string): number | null => {
  const offset = daysBetween(mondayOf(month), isoDay);

  if (offset < 0 || offset >= gridRowsOf(month) * DAYS_IN_WEEK) {
    return null;
  }

  return Math.floor(offset / DAYS_IN_WEEK);
};

export const settleRowOf = (month: string, isoDay: string): number =>
  rowOfDayIn(month, isoDay) ?? weekSpotOf(shiftDay(month, THURSDAY)).row;

export const mondayOfRow = (spot: CalendarFoldSpot): string =>
  shiftDay(mondayOf(spot.month), spot.row * DAYS_IN_WEEK);

export const gridSpanOf = (month: string): { from: string; to: string } => {
  const days = monthDaysOf(month);

  return { from: days[0] ?? month, to: days[days.length - 1] ?? month };
};

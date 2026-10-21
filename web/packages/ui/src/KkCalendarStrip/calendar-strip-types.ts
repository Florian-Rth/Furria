import type { KkGroupTone } from '../internal/group-tone';

export type KkCalendarTravel = 'earlier' | 'later' | 'none';

export type KkCalendarMark = KkGroupTone | 'club';

export interface KkCalendarDayData {
  isoDay: string;
  dayNumber: number;
  weekday: string;
  label: string;
  isToday: boolean;
  isPast: boolean;
  inMonth: boolean;
  selected: boolean;
  marks: readonly KkCalendarMark[];
  owed: boolean;
  landmark: boolean;
  carnival: boolean;
}

export type KkCalendarStripMode = 'days' | 'hours';

export type KkCalendarPull = 'open' | 'close' | 'none';

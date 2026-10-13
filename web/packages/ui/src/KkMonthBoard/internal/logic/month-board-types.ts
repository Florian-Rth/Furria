import type { KkGroupTone } from '../../../internal/group-tone';

export type KkMonthBoardDayMark = 'opening' | 'carnival';

export type KkMonthBoardTravel = 'earlier' | 'later' | 'none';

export interface KkMonthBoardDayData {
  isoDay: string;
  dayNumber: number;
  label: string;
  inMonth: boolean;
  isToday: boolean;
  selected: boolean;
  awaitsAnswer: boolean;
  mark: KkMonthBoardDayMark | null;
  markLabel: string | null;
}

export interface KkMonthBoardBarData {
  id: string;
  title: string;
  time: string | null;
  startDay: string;
  endDay: string;
  tone: KkGroupTone | null;
  running: boolean;
}

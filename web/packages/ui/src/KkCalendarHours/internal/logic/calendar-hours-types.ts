import type { KkAnswer } from '../../../internal/answer';
import type { KkGroupTone } from '../../../internal/group-tone';
import type { KkEntryKindGlyphKind } from '../../../KkEntryKindGlyph';

export type KkCalendarHoursTint = 'none' | 'today' | 'carnival';

export type KkCalendarHoursBadge = KkAnswer | 'owed' | null;

export type KkCalendarHoursDayMark = 'opening' | 'carnival';

export interface KkCalendarHoursAxis {
  startHour: number;
  endHour: number;
}

export interface KkCalendarHoursDayData {
  isoDay: string;
  weekday: string;
  dateLabel: string;
  label: string;
  isToday: boolean;
  selected: boolean;
  mark: KkCalendarHoursDayMark | null;
  markLabel: string | null;
}

export interface KkCalendarHoursSpan {
  startMinute: number;
  endMinute: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
  openEnd: boolean;
}

export interface KkCalendarHoursBlockData extends KkCalendarHoursSpan {
  id: string;
  title: string;
  time: string;
  label: string;
  kind: KkEntryKindGlyphKind;
  tone: KkGroupTone | null;
  running: boolean;
  usual: boolean;
  badge: KkCalendarHoursBadge;
  selected: boolean;
}

export interface KkCalendarPlacedBlock {
  block: KkCalendarHoursBlockData;
  row: number;
  left: number;
  width: number;
  room: number;
  roomBefore: number;
}

export interface KkCalendarHoursPlacement {
  rows: number;
  blocks: KkCalendarPlacedBlock[];
}

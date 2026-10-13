import type { KkAnswer, KkGroupTone, KkSheetAction } from '@furria/ui';
import type { EventCover } from '@/lib/event-cover';

export interface EntryGroupChip {
  groupId: number;
  name: string;
  tone: KkGroupTone;
}

export interface EntryVenueView {
  name: string;
  lines: string[];
  holdsKey: boolean;
}

export interface EntrySheetAnswer {
  label: string;
  value: KkAnswer | null;
  choose: (answer: KkAnswer) => void;
  error: string | undefined;
  disabled: boolean;
}

export interface EntrySheetView {
  sheetId: string;
  title: string;
  cover: EventCover | null;
  headline: string;
  runningNote: string | null;
  description: string | null;
  details: string | null;
  venue: EntryVenueView | null;
  owner: EntryGroupChip | null;
  participating: EntryGroupChip[];
  runsLine: string | null;
  answer: EntrySheetAnswer | null;
  primary: KkSheetAction | undefined;
  secondary: KkSheetAction | undefined;
}

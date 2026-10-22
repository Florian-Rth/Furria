import type { KkGroupTone } from '@furria/ui/group-tone';
import type { KkImageSource } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';
import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkStartTileMarkKind } from '@furria/ui/KkStartTileMark';
import type { KkStartTileReach } from '@furria/ui/reach';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import type { KkStartTileWhenTone } from '@furria/ui/when-tone';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { toPeekId } from '@/lib/peek';
import {
  answerTallyOf,
  entryIconOf,
  entryToneOf,
  splitCalendar,
  toEntryMark,
  toEntryMetaLine,
  toTileWhen,
} from '../calendar-tile';
import type { StartEntry } from '../schemas';
import type { StartPanelOf } from '../start-board';
import { isEntryRunningAt, toEntryAccessibleName, toRunningProgress } from '../start-labels';
import { toCalendarTick } from '../start-lines';
import { START_CALENDAR_SHEET, START_OWED_SHEET } from '../start-sheets';
import type { StartBoard } from './use-start-view';

export interface EntryMarkView {
  kind: KkStartTileMarkKind;
  label: string;
}

export interface CalendarLeadView {
  key: number;
  image: KkImageSource | null;
  tone: KkGroupTone;
  icon: KkIconName;
  eyebrow: string;
  eyebrowTone: KkStartTileWhenTone;
  time: string;
  title: string;
  meta: string | null;
  progress: number | null;
  mark: EntryMarkView | null;
  label: string;
  open: () => void;
}

export interface CalendarRowView {
  key: number;
  day: string;
  dayTone: KkStartTileWhenTone;
  time: string;
  title: string;
  tick: KkGroupTone | undefined;
  mark: EntryMarkView | null;
  label: string;
  open: () => void;
}

export interface OwedRingView {
  owed: number;
  answered: number;
  label: string;
  open: () => void;
}

export interface CalendarTileView {
  reach: KkStartTileReach;
  lead: CalendarLeadView | null;
  rows: CalendarRowView[];
  further: string | null;
  ring: OwedRingView | null;
}

const OWED_LABEL = 'Zu-/Absage offen';
const THUMB_SIZES = '6rem';

const markOf = (entry: StartEntry): EntryMarkView | null => {
  const kind = toEntryMark(entry);

  if (kind === null) {
    return null;
  }

  return {
    kind,
    label: kind === 'owed' ? OWED_LABEL : `Deine Antwort: ${ATTENDANCE_LABELS[kind]}`,
  };
};

const ringLabelOf = (owed: number): string =>
  owed === 1 ? '1 Antwort offen – jetzt antworten' : `${owed} Antworten offen – jetzt antworten`;

export const useCalendarTile = (
  panel: StartPanelOf<'calendar'>,
  board: StartBoard,
): CalendarTileView => {
  const sheet = useKkSheetCommands();
  const { now } = board;
  const split = splitCalendar(panel.entries, panel.shownCount);
  const tally = answerTallyOf(panel.entries);

  const opener = (entry: StartEntry) => (): void => {
    sheet.open(toPeekId('entry', entry.calendarEntryId));
  };

  const toLead = (entry: StartEntry): CalendarLeadView => {
    const when = toTileWhen(entry, now, null);
    const running = isEntryRunningAt(entry, now);

    return {
      key: entry.calendarEntryId,
      image: toImageSource(entry.event?.picture ?? null, 'banner', THUMB_SIZES),
      tone: entryToneOf(entry),
      icon: entryIconOf(entry),
      eyebrow: when.eyebrow,
      eyebrowTone: when.tone,
      time: when.time,
      title: entry.title,
      meta: toEntryMetaLine(entry),
      progress: running ? toRunningProgress(entry, now) : null,
      mark: markOf(entry),
      label: toEntryAccessibleName(entry, now),
      open: opener(entry),
    };
  };

  const toRow = (
    entry: StartEntry,
    index: number,
    rows: readonly StartEntry[],
  ): CalendarRowView => {
    const previous = index === 0 ? split.lead : rows[index - 1];
    const when = toTileWhen(entry, now, previous?.startsAt ?? null);

    return {
      key: entry.calendarEntryId,
      day: when.eyebrow,
      dayTone: when.tone,
      time: when.time,
      title: entry.title,
      tick: toCalendarTick(entry) ?? undefined,
      mark: markOf(entry),
      label: toEntryAccessibleName(entry, now),
      open: opener(entry),
    };
  };

  return {
    reach: {
      label: 'Kalender öffnen',
      onClick: () => {
        sheet.open(START_CALENDAR_SHEET);
      },
    },
    lead: split.lead === null ? null : toLead(split.lead),
    rows: split.next.map(toRow),
    further: split.further > 0 ? `+${split.further} weitere` : null,
    ring:
      tally.owed === 0
        ? null
        : {
            owed: tally.owed,
            answered: tally.answered,
            label: ringLabelOf(tally.owed),
            open: () => {
              sheet.open(START_OWED_SHEET);
            },
          },
  };
};

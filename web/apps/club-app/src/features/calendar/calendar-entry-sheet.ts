import type { EntryGroupChip, EntrySheetAnswer, EntrySheetView } from '@/features/entry-sheet';
import { toEventEditAction } from '@/features/entry-sheet';
import { toGroupTone } from '@/features/groups';
import { CALENDAR_KIND_LABELS } from '@/lib/calendar-copy';
import { toIsoDayLabel, toLocalIsoDay, toTimeSpanLabel } from '@/lib/calendar-days';
import { toEventStatusLabel } from '@/lib/event-copy';
import { toEventCover } from '@/lib/event-cover';
import { toPeekId } from '@/lib/peek';
import { RUNNING_CHIP_LABEL, toEventFactsLine } from './calendar-labels';
import type { CalendarEntry } from './schemas';

const PART_SEPARATOR = ' · ';
const COVER_SIZES = '(min-width: 900px) 32rem, 100vw';

const trimmed = (value: string | null): string | null => {
  const text = value?.trim() ?? '';

  return text === '' ? null : text;
};

const ownerOf = (entry: CalendarEntry): EntryGroupChip | null =>
  entry.ownerGroupId === null
    ? null
    : {
        groupId: entry.ownerGroupId,
        name: entry.ownerGroupName ?? '',
        tone: toGroupTone(entry.ownerGroupId, entry.ownerGroupTone),
      };

const headlineOf = (entry: CalendarEntry): string => {
  const day = toIsoDayLabel(toLocalIsoDay(entry.startsAt));
  const span = `${day}, ${toTimeSpanLabel(entry.startsAt, entry.endsAt)}`;

  return `${CALENDAR_KIND_LABELS[entry.kind]}${PART_SEPARATOR}${span}`;
};

const eventDetailsOf = (entry: CalendarEntry): string | null => {
  if (entry.event === null) {
    return null;
  }

  const facts = toEventFactsLine(entry.event);
  const status = toEventStatusLabel(entry.event);

  return facts === null ? status : `${status}${PART_SEPARATOR}${facts}`;
};

export const toCalendarEntrySheet = (
  entry: CalendarEntry,
  managesEvents: boolean,
  answer: EntrySheetAnswer | null,
): EntrySheetView => {
  const { calendarEntryId, event } = entry;

  return {
    sheetId: toPeekId('entry', calendarEntryId),
    title: entry.title,
    cover:
      event === null
        ? null
        : toEventCover(
            {
              eventId: calendarEntryId,
              picture: event.picture,
              isCancelled: event.status === 'cancelled',
            },
            COVER_SIZES,
          ),
    headline: headlineOf(entry),
    runningNote: entry.isRunning ? RUNNING_CHIP_LABEL : null,
    description: trimmed(event?.teaser ?? null) ?? trimmed(entry.description),
    details: eventDetailsOf(entry),
    venue: entry.venueName === null ? null : { name: entry.venueName, lines: [], holdsKey: false },
    owner: ownerOf(entry),
    participating: entry.participatingGroups
      .filter((group) => group.groupId !== entry.ownerGroupId)
      .map((group) => ({
        groupId: group.groupId,
        name: group.name,
        tone: toGroupTone(group.groupId, group.tone),
      })),
    runsLine: null,
    answer,
    primary: event !== null && managesEvents ? toEventEditAction(calendarEntryId) : undefined,
    secondary: undefined,
  };
};

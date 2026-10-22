import type { KkSheetAction } from '@furria/ui/sheet-actions';
import { Link, useNavigate } from '@tanstack/react-router';
import { toEventEditAction } from '@/features/entry-sheet/event-edit-action';
import type { EntryGroupChip, EntrySheetView } from '@/features/entry-sheet/types';
import { toGroupTone } from '@/features/groups/group-identity';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toEventCover } from '@/lib/event-cover';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import {
  toEntryGroups,
  toEntryHeadline,
  toEntryOnward,
  toEntryVenue,
  toRunningNote,
  toRunsLine,
} from '../entry-sheet';
import type { StartEntry, StartGroupRef } from '../schemas';
import { entriesOf } from '../start-sheets';
import { useEntryAnswer } from './use-entry-answer';
import type { StartBoard } from './use-start-view';

const CALENDAR_ROUTE = '/calendar';
const GROUP_ROUTE = '/groups/$groupId';
const CALENDAR_LABEL = 'Im Kalender';
const COVER_SIZES = '(min-width: 900px) 32rem, 100vw';

const toEntryId = (entry: StartEntry): number => entry.calendarEntryId;

const chipOf = (group: StartGroupRef): EntryGroupChip => ({
  groupId: group.groupId,
  name: group.name,
  tone: toGroupTone(group.groupId, group.tone),
});

const settled = (): void => undefined;

export const useEntryPeek = (board: StartBoard): StartEntry | null =>
  usePeek('entry', entriesOf(board.start), toEntryId);

export const useEntrySheet = (entry: StartEntry, board: StartBoard): EntrySheetView => {
  const managesEvents = usePermissions().has(PERMISSION_KEYS.eventsManage);
  const navigate = useNavigate();
  const { calendarEntryId } = entry;
  const answer = useEntryAnswer({ calendarEntryId, onTouch: board.touch, onHeld: settled });
  const groups = toEntryGroups(entry);
  const onward = toEntryOnward(entry, board.canReadClub);
  const description = entry.description?.trim() ?? '';

  const toCalendar = (day: string): KkSheetAction => ({
    label: CALENDAR_LABEL,
    onClick: () => {
      void navigate({ to: CALENDAR_ROUTE, search: { day } });
    },
  });

  const onwardAction = (): KkSheetAction | undefined => {
    if (onward.kind === 'calendar') {
      return toCalendar(onward.day);
    }
    if (onward.kind === 'group') {
      return {
        label: `Zur Gruppe ${onward.name}`,
        component: Link,
        to: GROUP_ROUTE,
        params: { groupId: String(onward.groupId) },
      };
    }

    return undefined;
  };

  return {
    sheetId: toPeekId('entry', calendarEntryId),
    title: entry.title,
    cover:
      entry.event === null
        ? null
        : toEventCover(
            {
              eventId: calendarEntryId,
              picture: entry.event.picture,
              isCancelled: entry.event.isCancelled,
            },
            COVER_SIZES,
          ),
    headline: toEntryHeadline(entry),
    runningNote: toRunningNote(entry, board.now),
    venue: toEntryVenue(entry.venue, entry.viewerHoldsVenueKey),
    owner: groups.owner === null ? null : chipOf(groups.owner),
    participating: groups.participating.map(chipOf),
    runsLine: toRunsLine(entry),
    description: description === '' ? null : description,
    details: null,
    answer:
      entry.attendance === null
        ? null
        : {
            label: `Deine Antwort für ${entry.title}`,
            value: entry.attendance.viewerAnswer,
            choose: answer.choose,
            error: answer.failure,
            disabled: answer.dims,
          },
    primary: onwardAction(),
    secondary:
      entry.event !== null && managesEvents ? toEventEditAction(calendarEntryId) : undefined,
  };
};

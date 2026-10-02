import type { KkAnswer, KkGroupTone, KkSheetAction } from '@furria/ui';
import { Link, useNavigate } from '@tanstack/react-router';
import { toGroupTone } from '@/features/groups';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import type { EntryVenueView } from '../entry-sheet';
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

export interface EntryGroupChip {
  groupId: number;
  name: string;
  tone: KkGroupTone;
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
  headline: string;
  runningNote: string | null;
  venue: EntryVenueView | null;
  owner: EntryGroupChip | null;
  participating: EntryGroupChip[];
  runsLine: string | null;
  description: string | null;
  answer: EntrySheetAnswer | null;
  onward: KkSheetAction | undefined;
}

const CALENDAR_ROUTE = '/calendar';
const GROUP_ROUTE = '/groups/$groupId';
const CALENDAR_LABEL = 'Im Kalender';
const LIST_VIEW = 'list';

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
  const navigate = useNavigate();
  const { calendarEntryId } = entry;
  const answer = useEntryAnswer({ calendarEntryId, onTouch: board.touch, onHeld: settled });
  const groups = toEntryGroups(entry);
  const onward = toEntryOnward(entry, board.canReadClub);
  const description = entry.description?.trim() ?? '';

  const toCalendar = (day: string): KkSheetAction => ({
    label: CALENDAR_LABEL,
    onClick: () => {
      void navigate({ to: CALENDAR_ROUTE, search: { view: LIST_VIEW, day } });
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
    headline: toEntryHeadline(entry),
    runningNote: toRunningNote(entry, board.now),
    venue: toEntryVenue(entry.venue, entry.viewerHoldsVenueKey),
    owner: groups.owner === null ? null : chipOf(groups.owner),
    participating: groups.participating.map(chipOf),
    runsLine: toRunsLine(entry),
    description: description === '' ? null : description,
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
    onward: onwardAction(),
  };
};

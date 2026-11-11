import { useState } from 'react';
import { useMeQuery } from '@/features/session/api';
import { ATTENDANCE_ROLL_LABELS } from '@/lib/calendar-copy';
import { useOwnSignUpLineDeletionMutation, useOwnSignUpLineMutation } from '../api';
import { toLineRemoveLabel, toSignUpListMetaLabel } from '../calendar-labels';
import type { NamesTab } from '../calendar-names';
import { toCappedList, toOpenTab, toOwnFirst } from '../calendar-names';
import { toPersonName } from '../calendar-people';
import type { CalendarReminderSource } from '../calendar-reminders';
import { toSignUpListReminderSource } from '../calendar-reminders';
import {
  toLineText,
  toOwnLineState,
  toSignUpLineRows,
  toViewerLine,
} from '../calendar-sign-up-lists';
import type { CalendarEntry, CalendarSignUpList } from '../schemas';
import type { CalendarSignUpLineRemovalControl } from './use-calendar-sign-up-line-removal';
import type { NamesSheetControl } from './use-names-sheet';
import { useNamesSheet } from './use-names-sheet';

const SIGN_UP_LABEL = 'Eintragen';
const CHANGE_LABEL = 'Ändern';
const DELETE_OWN_LABEL = 'Austragen';
const LINES_TAB_LABEL = 'Einträge';
export const LINES_TAB_ID = 'lines';
export const INLINE_LINE_LIMIT = 5;

const toAllLinesLabel = (count: number): string => `Alle ${count} Einträge`;

export interface CalendarSignUpLineView {
  lineId: number;
  name: string;
  text: string | undefined;
  isOwn: boolean;
  removeLabel: string | undefined;
  askRemoval: (() => void) | undefined;
}

export interface CalendarSignUpListControl {
  title: string;
  hint: string | undefined;
  meta: string | undefined;
  lines: CalendarSignUpLineView[];
  allLinesLabel: string | undefined;
  openAllLines: () => void;
  tabs: NamesTab[];
  openTab: NamesTab | null;
  sheet: NamesSheetControl;
  takesLines: boolean;
  draft: string;
  saveLabel: string;
  deleteOwnLabel: string | undefined;
  canSave: boolean;
  isBusy: boolean;
  setDraft: (draft: string) => void;
  save: () => void;
  deleteOwnLine: () => void;
  reminder: CalendarReminderSource;
}

const toHeldText = (list: CalendarSignUpList): string => toViewerLine(list)?.text ?? '';

export const useCalendarSignUpList = (
  list: CalendarSignUpList,
  mayModerate: boolean,
  entry: Pick<CalendarEntry, 'calendarEntryId' | 'mayAnswer'>,
  removal: CalendarSignUpLineRemovalControl,
): CalendarSignUpListControl => {
  const mayAnswer = entry.mayAnswer;
  const saving = useOwnSignUpLineMutation();
  const deleting = useOwnSignUpLineDeletionMutation();
  const heldText = toHeldText(list);
  const [draft, setDraft] = useState(heldText);
  const [seenText, setSeenText] = useState(heldText);

  if (seenText !== heldText) {
    setSeenText(heldText);
    setDraft(heldText);
  }

  const ownPersonId = useMeQuery().data?.person?.id ?? null;
  const sheet = useNamesSheet();
  const own = toOwnLineState(list, draft);
  const isBusy = saving.isPending || deleting.isPending || removal.isRemoving;
  const takesLines = own.isOpen && mayAnswer;

  const lines = toSignUpLineRows(list, mayModerate).map((row): CalendarSignUpLineView => {
    const name = toPersonName(row);

    return {
      lineId: row.lineId,
      name,
      text: row.text ?? undefined,
      isOwn: row.byViewer,
      removeLabel: row.canRemove ? toLineRemoveLabel(name) : undefined,
      askRemoval: row.canRemove
        ? () => {
            if (isBusy) {
              return;
            }

            removal.ask({ lineId: row.lineId, name });
          }
        : undefined,
    };
  });

  const capped = toCappedList(toOwnFirst(lines), INLINE_LINE_LIMIT);
  const linesTab: NamesTab = {
    id: LINES_TAB_ID,
    label: LINES_TAB_LABEL,
    count: lines.length,
    entries: lines.map((line) => ({
      key: String(line.lineId),
      name: line.name,
      isOwn: line.isOwn,
      text: line.text,
      removeLabel: line.removeLabel,
      remove: line.askRemoval,
    })),
  };
  const openTab = toOpenTab(list.notAnswered, ownPersonId, ATTENDANCE_ROLL_LABELS.open);

  return {
    allLinesLabel: capped.hidden === 0 ? undefined : toAllLinesLabel(lines.length),
    openAllLines: () => {
      sheet.open(LINES_TAB_ID);
    },
    tabs: openTab === null ? [linesTab] : [linesTab, openTab],
    openTab,
    sheet,
    reminder: toSignUpListReminderSource(entry.calendarEntryId, list),
    title: list.title,
    hint: list.hint ?? undefined,
    meta: toSignUpListMetaLabel(list),
    lines: capped.shown,
    takesLines,
    draft,
    saveLabel: own.hasLine ? CHANGE_LABEL : SIGN_UP_LABEL,
    deleteOwnLabel: own.hasLine ? DELETE_OWN_LABEL : undefined,
    canSave: takesLines && own.canSave && !isBusy,
    isBusy,
    setDraft,
    save: () => {
      if (isBusy || !takesLines) {
        return;
      }

      saving.mutate({ signUpListId: list.signUpListId, text: toLineText(draft) });
    },
    deleteOwnLine: () => {
      if (isBusy) {
        return;
      }

      deleting.mutate({ signUpListId: list.signUpListId });
    },
  };
};

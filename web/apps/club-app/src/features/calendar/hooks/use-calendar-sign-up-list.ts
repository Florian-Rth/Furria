import { useState } from 'react';
import { useMeQuery } from '@/features/session/api';
import { ATTENDANCE_ROLL_LABELS } from '@/lib/calendar-copy';
import type { AddOnAnswering } from '../add-on-host';
import { useOwnSignUpLineDeletionMutation, useOwnSignUpLineMutation } from '../api';
import {
  toLineCountLabel,
  toLineRemoveLabel,
  toSignUpListCountLabel,
  toSignUpListNoteLabel,
} from '../calendar-labels';
import type { NamesTab } from '../calendar-names';
import { toCappedList, toOpenTab, toOwnFirst } from '../calendar-names';
import { toPersonName } from '../calendar-people';
import type { CalendarReminderSource } from '../calendar-reminders';
import { toSignUpListReminderSource } from '../calendar-reminders';
import type { OwnLineBox } from '../calendar-sign-up-lists';
import {
  toLineText,
  toOwnLineBox,
  toOwnLineState,
  toSignUpLineRows,
  toViewerLine,
} from '../calendar-sign-up-lists';
import type { CalendarSignUpList } from '../schemas';
import type { CalendarSignUpLineRemovalControl } from './use-calendar-sign-up-line-removal';
import type { NamesSheetControl } from './use-names-sheet';
import { useNamesSheet } from './use-names-sheet';

const SIGN_UP_LABEL = 'Eintragen';
const SAVE_LABEL = 'Speichern';
const EMPTY_OWN_LINE_LABEL = 'Eingetragen';
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
  count: string | undefined;
  note: string | undefined;
  sheetCount: string | undefined;
  lines: CalendarSignUpLineView[];
  allLinesLabel: string | undefined;
  openAllLines: () => void;
  tabs: NamesTab[];
  openTab: NamesTab | null;
  sheet: NamesSheetControl;
  ownBox: OwnLineBox;
  ownText: string;
  draft: string;
  saveLabel: string;
  canSave: boolean;
  isBusy: boolean;
  setDraft: (draft: string) => void;
  save: () => void;
  edit: () => void;
  cancelEdit: () => void;
  deleteOwnLine: () => void;
  reminder: CalendarReminderSource;
}

const toHeldText = (list: CalendarSignUpList): string => toViewerLine(list)?.text ?? '';

export const useCalendarSignUpList = (
  list: CalendarSignUpList,
  mayModerate: boolean,
  { host, mayAnswer }: AddOnAnswering,
  removal: CalendarSignUpLineRemovalControl,
): CalendarSignUpListControl => {
  const saving = useOwnSignUpLineMutation();
  const deleting = useOwnSignUpLineDeletionMutation();
  const heldText = toHeldText(list);
  const [draft, setDraft] = useState(heldText);
  const [seenText, setSeenText] = useState(heldText);
  const [isEditing, setIsEditing] = useState(false);

  if (seenText !== heldText) {
    setSeenText(heldText);
    setDraft(heldText);
    setIsEditing(false);
  }

  const ownPersonId = useMeQuery().data?.person?.id ?? null;
  const sheet = useNamesSheet();
  const own = toOwnLineState(list, draft);
  const isBusy = saving.isPending || deleting.isPending || removal.isRemoving;
  const takesLines = own.isOpen && mayAnswer;
  const ownBox = toOwnLineBox({
    isClosed: list.isClosed,
    mayAnswer,
    hasLine: own.hasLine,
    isEditing,
  });

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

  const others = ownBox === 'hidden' ? lines : lines.filter((line) => !line.isOwn);
  const capped = toCappedList(others, INLINE_LINE_LIMIT);
  const linesTab: NamesTab = {
    id: LINES_TAB_ID,
    label: LINES_TAB_LABEL,
    count: lines.length,
    entries: toOwnFirst(lines).map((line) => ({
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
    reminder: toSignUpListReminderSource(host, list),
    title: list.title,
    count: toSignUpListCountLabel(list),
    note: toSignUpListNoteLabel(list),
    sheetCount: toLineCountLabel(lines.length),
    lines: capped.shown,
    ownBox,
    ownText: heldText === '' ? EMPTY_OWN_LINE_LABEL : heldText,
    draft,
    saveLabel: own.hasLine ? SAVE_LABEL : SIGN_UP_LABEL,
    canSave: takesLines && own.canSave && !isBusy,
    isBusy,
    setDraft,
    save: () => {
      if (isBusy || !takesLines) {
        return;
      }

      saving.mutate({
        hostKind: host.kind,
        signUpListId: list.signUpListId,
        text: toLineText(draft),
      });
    },
    edit: () => {
      setIsEditing(true);
    },
    cancelEdit: () => {
      setDraft(heldText);
      setIsEditing(false);
    },
    deleteOwnLine: () => {
      if (isBusy) {
        return;
      }

      deleting.mutate({ hostKind: host.kind, signUpListId: list.signUpListId });
    },
  };
};

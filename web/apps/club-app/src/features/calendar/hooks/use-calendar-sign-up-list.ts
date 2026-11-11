import { useState } from 'react';
import { useOwnSignUpLineDeletionMutation, useOwnSignUpLineMutation } from '../api';
import { toLineRemoveLabel, toSignUpListMetaLabel } from '../calendar-labels';
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

const SIGN_UP_LABEL = 'Eintragen';
const CHANGE_LABEL = 'Ändern';
const DELETE_OWN_LABEL = 'Austragen';

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

  return {
    reminder: toSignUpListReminderSource(entry.calendarEntryId, list),
    title: list.title,
    hint: list.hint ?? undefined,
    meta: toSignUpListMetaLabel(list),
    lines,
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

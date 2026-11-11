import { useState } from 'react';
import { useOwnSignUpLineMutation } from '@/features/calendar/api';
import {
  SIGN_UP_LINE_TEXT_MAX_LENGTH,
  toLineText,
} from '@/features/calendar/calendar-sign-up-lists';
import type { StartEntry, StartSignUpList } from '../schemas';
import { itemKeyOf } from '../start-visit';
import type { StartBoard } from './use-start-view';

const EMPTY_OWN_LINE_LABEL = 'Eingetragen';

export interface OwedSignUpView {
  title: string;
  hint: string | undefined;
  isSigned: boolean;
  ownText: string;
  draft: string;
  canSave: boolean;
  isBusy: boolean;
  setDraft: (draft: string) => void;
  save: () => void;
}

export const useOwedSignUp = (
  entry: StartEntry,
  list: StartSignUpList,
  board: StartBoard,
): OwedSignUpView => {
  const saving = useOwnSignUpLineMutation();
  const [draft, setDraft] = useState('');
  const isBusy = saving.isPending;
  const isTooLong = draft.trim().length > SIGN_UP_LINE_TEXT_MAX_LENGTH;

  return {
    title: list.title,
    hint: list.hint ?? undefined,
    isSigned: !list.isOwed,
    ownText: list.viewerText ?? EMPTY_OWN_LINE_LABEL,
    draft,
    canSave: list.isOwed && !isBusy && !isTooLong,
    isBusy,
    setDraft,
    save: () => {
      if (isBusy || !list.isOwed || isTooLong) {
        return;
      }

      board.touch(itemKeyOf({ panel: 'calendar', calendarEntryId: entry.calendarEntryId }));
      saving.mutate({ signUpListId: list.signUpListId, text: toLineText(draft) });
    },
  };
};

import { useSignUpListClosingMutation } from '../api';
import { toSignUpListCloseQuestion } from '../calendar-labels';
import type { CalendarConfirmCopy } from '../components/CalendarConfirmDialog';
import type { CalendarSignUpList } from '../schemas';

const CLOSE_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'LISTE SCHLIESSEN',
  explanation: 'Danach kann sich niemand mehr eintragen oder austragen.',
  confirmLabel: 'Schließen',
  cancelLabel: 'Offen lassen',
  closeLabel: 'Abbrechen',
};

export interface CalendarSignUpListClosingControl {
  canClose: boolean;
  isClosing: boolean;
  copy: CalendarConfirmCopy;
  close: () => void;
}

export const useCalendarSignUpListClosing = (
  list: Pick<CalendarSignUpList, 'signUpListId' | 'title' | 'isClosed'>,
  mayModerate: boolean,
): CalendarSignUpListClosingControl => {
  const closing = useSignUpListClosingMutation();

  return {
    canClose: mayModerate && !list.isClosed,
    isClosing: closing.isPending,
    copy: { ...CLOSE_COPY, question: toSignUpListCloseQuestion(list.title) },
    close: () => {
      closing.mutate({ signUpListId: list.signUpListId });
    },
  };
};

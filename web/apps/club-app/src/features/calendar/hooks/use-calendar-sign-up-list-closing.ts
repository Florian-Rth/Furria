import { useSignUpListClosingMutation } from '../api';
import { toSignUpListCloseQuestion } from '../calendar-labels';
import type { CalendarSignUpList } from '../schemas';

export interface CalendarSignUpListClosingControl {
  canClose: boolean;
  isClosing: boolean;
  question: string;
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
    question: toSignUpListCloseQuestion(list.title),
    close: () => {
      closing.mutate({ signUpListId: list.signUpListId });
    },
  };
};

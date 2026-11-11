import { useMinuteNow } from '@/lib/use-minute-now';
import { usePollClosingMutation, usePollReopeningMutation } from '../api';
import { toPollCloseQuestion } from '../calendar-labels';
import { mayClosePoll, mayReopenPoll } from '../calendar-polls';
import type { CalendarConfirmCopy } from '../components/CalendarConfirmDialog';
import type { CalendarPoll } from '../schemas';

const CLOSE_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'UMFRAGE BEENDEN',
  explanation: 'Danach kann niemand mehr abstimmen.',
  confirmLabel: 'Beenden',
  cancelLabel: 'Offen lassen',
  closeLabel: 'Schließen',
};

export interface CalendarPollClosingControl {
  canClose: boolean;
  isClosing: boolean;
  closeCopy: CalendarConfirmCopy;
  close: () => void;
  canReopen: boolean;
  isReopening: boolean;
  reopen: () => void;
}

interface CalendarPollClosingInput {
  poll: CalendarPoll;
  mayClose: boolean;
  startsAt: string;
}

export const useCalendarPollClosing = ({
  poll,
  mayClose,
  startsAt,
}: CalendarPollClosingInput): CalendarPollClosingControl => {
  const closing = usePollClosingMutation();
  const reopening = usePollReopeningMutation();
  const nowMs = useMinuteNow().getTime();

  return {
    canClose: mayClosePoll({ poll, mayClose }),
    isClosing: closing.isPending,
    closeCopy: { ...CLOSE_COPY, question: toPollCloseQuestion(poll.question) },
    close: () => {
      closing.mutate({ pollId: poll.pollId });
    },
    canReopen: mayReopenPoll({ poll, mayClose, startsAt, nowMs }),
    isReopening: reopening.isPending,
    reopen: () => {
      reopening.mutate({ pollId: poll.pollId });
    },
  };
};

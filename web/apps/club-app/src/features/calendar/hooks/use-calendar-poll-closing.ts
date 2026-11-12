import { useMinuteNow } from '@/lib/use-minute-now';
import { usePollClosingMutation, usePollReopeningMutation } from '../api';
import { toPollCloseQuestion } from '../calendar-labels';
import { mayClosePoll, mayReopenPoll } from '../calendar-polls';
import type { CalendarConfirmCopy } from '../components/CalendarConfirmDialog';
import type { AddOnHostKind, CalendarPoll } from '../schemas';

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
  hostKind: AddOnHostKind;
  poll: CalendarPoll;
  mayClose: boolean;
  reopensUntil: string | null;
}

export const useCalendarPollClosing = ({
  hostKind,
  poll,
  mayClose,
  reopensUntil,
}: CalendarPollClosingInput): CalendarPollClosingControl => {
  const closing = usePollClosingMutation();
  const reopening = usePollReopeningMutation();
  const nowMs = useMinuteNow().getTime();

  return {
    canClose: mayClosePoll({ poll, mayClose }),
    isClosing: closing.isPending,
    closeCopy: { ...CLOSE_COPY, question: toPollCloseQuestion(poll.question) },
    close: () => {
      closing.mutate({ hostKind, pollId: poll.pollId });
    },
    canReopen: mayReopenPoll({ poll, mayClose, reopensUntil, nowMs }),
    isReopening: reopening.isPending,
    reopen: () => {
      reopening.mutate({ hostKind, pollId: poll.pollId });
    },
  };
};

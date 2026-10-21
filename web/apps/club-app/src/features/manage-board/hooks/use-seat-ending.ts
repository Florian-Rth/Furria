import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndBoardSeatMutation } from '../api';
import { toEndSeatConsequence, toPersonName } from '../manage-board-labels';
import type { BoardOffice, BoardSeat } from '../schemas';
import { BoardSeatEndFormSchema } from '../schemas';

export interface SeatEndingControl {
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  endedOnError: string | undefined;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useSeatEnding = (
  office: BoardOffice,
  seat: BoardSeat,
  today: string,
  onDone: () => void,
): SeatEndingControl => {
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [tried, setTried] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useEndBoardSeatMutation(office.boardOfficeId);
  const parsed = BoardSeatEndFormSchema.safeParse({ endedOn });

  const submit = (): void => {
    setTried(true);
    setRejection(null);
    if (!parsed.success) {
      return;
    }

    void mutation
      .mutateAsync({
        boardSeatId: seat.boardSeatId,
        personName: toPersonName(seat),
        endedOn: parsed.data.endedOn,
      })
      .then(onDone, (error: Error) => {
        setRejection(toWriteErrorMessage(error));
      });
  };

  return {
    endedOn,
    setEndedOn,
    endedOnError: parsed.success || !tried ? undefined : parsed.error.issues[0]?.message,
    consequence:
      endedOn === null
        ? null
        : toEndSeatConsequence(seat.firstName, office.name, office.impliedRoleName, endedOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

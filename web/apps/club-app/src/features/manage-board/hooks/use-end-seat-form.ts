import { useState } from 'react';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndBoardSeatMutation } from '../api';
import { toEndSeatConsequence, toPersonName } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

interface EndSeatFormInput {
  boardOfficeId: number;
  officeName: string;
  impliedRoleName: string | null;
  seat: BoardSeat | null;
  onEnded: () => void;
}

export interface EndSeatFormControl {
  seat: BoardSeat | null;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useEndSeatForm = ({
  boardOfficeId,
  officeName,
  impliedRoleName,
  seat,
  onEnded,
}: EndSeatFormInput): EndSeatFormControl => {
  const today = toIsoDay(new Date());
  const [shown, setShown] = useState<BoardSeat | null>(seat);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useEndBoardSeatMutation(boardOfficeId);

  if (seat !== null && seat.boardSeatId !== shown?.boardSeatId) {
    setShown(seat);
    setEndedOn(today);
    setRejection(null);
  }

  const submit = (): void => {
    if (shown === null || endedOn === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { boardSeatId: shown.boardSeatId, personName: toPersonName(shown), endedOn },
      {
        onSuccess: onEnded,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    seat: shown,
    endedOn,
    setEndedOn,
    consequence:
      shown === null || endedOn === null
        ? null
        : toEndSeatConsequence(shown.firstName, officeName, impliedRoleName, endedOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

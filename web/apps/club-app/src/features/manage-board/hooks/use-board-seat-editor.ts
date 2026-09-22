import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndBoardSeatMutation, useOpenBoardSeatMutation } from '../api';
import { toEndSeatConsequence, toPersonName, toSeatConsequence } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';

const END_LABEL = 'Vorstandssitz beenden';
const ADD_LABEL = 'Vorstandssitz eintragen';

interface BoardSeatEditorInput {
  boardOfficeId: number;
  officeName: string;
  impliedRoleName: string | null;
  seat: BoardSeat | null;
}

export interface BoardSeatEditorControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  actionLabel: string;
  submit: () => void;
}

export const useBoardSeatEditor = ({
  boardOfficeId,
  officeName,
  impliedRoleName,
  seat,
}: BoardSeatEditorInput): BoardSeatEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = seat !== null;

  const [person, setPerson] = useState<PersonRef | null>(null);
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);

  const openMutation = useOpenBoardSeatMutation(boardOfficeId, officeName);
  const endMutation = useEndBoardSeatMutation(boardOfficeId);
  const navigate = useNavigate();

  const personName = person === null ? '' : toPersonName(person);
  const seatPersonName = seat === null ? '' : toPersonName(seat);

  const landBack = (boardSeatId: number): void => {
    void navigate({
      to: '/manage/board',
      search: (previous) => ({ ...previous, changed: toLandingKey('board-seat', boardSeatId) }),
      replace: true,
    });
  };

  const clearPerson = (): void => {
    setPerson(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    setPerson(next);
    setRejection(null);
  };

  const submitOpen = (): void => {
    if (person === null || sinceOn === null) {
      return;
    }

    setRejection(null);
    openMutation.mutate(
      { personId: person.personId, personName, sinceOn },
      {
        onSuccess: (opened) => {
          landBack(opened.boardSeatId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const submitEnd = (): void => {
    if (seat === null || endedOn === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      { boardSeatId: seat.boardSeatId, personName: seatPersonName, endedOn },
      {
        onSuccess: () => {
          landBack(seat.boardSeatId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const consequence = isEditing
    ? endedOn === null
      ? null
      : toEndSeatConsequence(seatPersonName, officeName, impliedRoleName, endedOn, today)
    : person === null || sinceOn === null
      ? null
      : toSeatConsequence(personName, officeName, impliedRoleName, sinceOn, today);

  return {
    person,
    select,
    clearPerson,
    sinceOn,
    setSinceOn,
    endedOn,
    setEndedOn,
    consequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : openMutation.isPending,
    isDirty: isEditing ? endedOn !== today : person !== null,
    actionLabel: isEditing ? END_LABEL : ADD_LABEL,
    submit: isEditing ? submitEnd : submitOpen,
  };
};

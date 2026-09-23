import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndBoardSeatMutation, useOpenBoardSeatMutation } from '../api';
import { toEndSeatConsequence, toPersonName, toSeatConsequence } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';
import { BoardSeatEndFormSchema, BoardSeatOpenFormSchema } from '../schemas';

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
  sinceOnError: string | undefined;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  endedOnError: string | undefined;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
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
  const [rejection, setRejection] = useState<string | null>(null);

  const openMutation = useOpenBoardSeatMutation(boardOfficeId, officeName);
  const endMutation = useEndBoardSeatMutation(boardOfficeId);
  const navigate = useNavigate();

  const openForm = useForm({
    resolver: zodResolver(BoardSeatOpenFormSchema),
    defaultValues: { person: null, sinceOn: today },
    mode: 'onTouched',
  });
  const endForm = useForm({
    resolver: zodResolver(BoardSeatEndFormSchema),
    defaultValues: { endedOn: today },
    mode: 'onTouched',
  });
  const openState = openForm.formState;
  const endState = endForm.formState;
  const { isDirty: isOpenDirty, isValid: isOpenValid } = openState;
  const { isDirty: isEndDirty, isValid: isEndValid } = endState;
  const personField = useController({ control: openForm.control, name: 'person' });
  const sinceOnField = useController({ control: openForm.control, name: 'sinceOn' });
  const endedOnField = useController({ control: endForm.control, name: 'endedOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = person === null ? '' : toPersonName(person);
  const seatPersonName = seat === null ? '' : toPersonName(seat);

  const landBack = (boardSeatId: number): void => {
    void navigate({
      to: '/manage/board',
      search: (previous) => ({ ...previous, changed: toLandingKey('board-seat', boardSeatId) }),
      replace: true,
    });
  };

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const clearPerson = (): void => {
    personField.field.onChange(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    personField.field.onChange(next);
    setRejection(null);
  };

  const submitOpen = openForm.handleSubmit((values) => {
    setRejection(null);
    openMutation.mutate(
      {
        personId: values.person.personId,
        personName: toPersonName(values.person),
        sinceOn: values.sinceOn,
      },
      { onSuccess: (opened) => landBack(opened.boardSeatId), onError: fail },
    );
  });

  const submitEnd = endForm.handleSubmit((values) => {
    if (seat === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      { boardSeatId: seat.boardSeatId, personName: seatPersonName, endedOn: values.endedOn },
      { onSuccess: () => landBack(seat.boardSeatId), onError: fail },
    );
  });

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
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: openState.errors.sinceOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: endState.errors.endedOn?.message,
    consequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : openMutation.isPending,
    isDirty: isEditing ? isEndDirty : isOpenDirty,
    canSubmit: isEditing ? isEndValid : isOpenValid,
    actionLabel: isEditing ? END_LABEL : ADD_LABEL,
    submit: () => {
      void (isEditing ? submitEnd() : submitOpen());
    },
  };
};

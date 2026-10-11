import { useController } from 'react-hook-form';
import type { WriteLanding } from '@/features/write';
import { useWriteForm } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { useEndBoardSeatMutation, useOpenBoardSeatMutation } from '../api';
import { toEndSeatConsequence, toPersonName, toSeatConsequence } from '../manage-board-labels';
import type { BoardSeat } from '../schemas';
import { BoardSeatEndFormSchema, BoardSeatOpenFormSchema } from '../schemas';

const END_LABEL = 'Vorstandssitz beenden';
const ADD_LABEL = 'Vorstandssitz eintragen';

const toBoardLanding = (boardSeatId: number): WriteLanding => ({
  to: '/manage/board',
  mark: { kind: 'board-seat', id: boardSeatId },
});

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
  const openMutation = useOpenBoardSeatMutation(boardOfficeId, officeName);
  const endMutation = useEndBoardSeatMutation(boardOfficeId);
  const seatPersonName = seat === null ? '' : toPersonName(seat);

  const opening = useWriteForm({
    schema: BoardSeatOpenFormSchema,
    defaults: { person: null, sinceOn: today },
    mutate: (values) =>
      openMutation
        .mutateAsync({
          personId: values.person.personId,
          personName: toPersonName(values.person),
          sinceOn: values.sinceOn,
        })
        .then((opened) => opened.boardSeatId),
    landing: toBoardLanding,
  });
  const ending = useWriteForm({
    schema: BoardSeatEndFormSchema,
    defaults: { endedOn: today },
    mutate: (values) =>
      seat === null
        ? null
        : endMutation
            .mutateAsync({
              boardSeatId: seat.boardSeatId,
              personName: seatPersonName,
              endedOn: values.endedOn,
            })
            .then(() => seat.boardSeatId),
    landing: toBoardLanding,
  });
  const personField = useController({ control: opening.form.control, name: 'person' });
  const sinceOnField = useController({ control: opening.form.control, name: 'sinceOn' });
  const endedOnField = useController({ control: ending.form.control, name: 'endedOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = person === null ? '' : toPersonName(person);
  const isEditing = seat !== null;
  const write = isEditing ? ending : opening;

  const consequence = isEditing
    ? endedOn === null
      ? null
      : toEndSeatConsequence(seatPersonName, officeName, impliedRoleName, endedOn, today)
    : person === null || sinceOn === null
      ? null
      : toSeatConsequence(personName, officeName, impliedRoleName, sinceOn, today);

  return {
    person,
    select: personField.field.onChange,
    clearPerson: () => {
      personField.field.onChange(null);
    },
    sinceOn,
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: opening.form.formState.errors.sinceOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: ending.form.formState.errors.endedOn?.message,
    consequence,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    actionLabel: isEditing ? END_LABEL : ADD_LABEL,
    submit: write.submit,
  };
};

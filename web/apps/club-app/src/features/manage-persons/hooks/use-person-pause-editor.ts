import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { sessionAt } from '@/lib/club';
import { useCreatePauseMutation, useUpdatePauseMutation } from '../api';
import {
  ADD_PAUSE_ACTION_LABEL,
  PAUSE_CHANGE_LABEL,
  toPauseConsequence,
} from '../manage-persons-labels';
import type { PersonMembership, PersonPause } from '../schemas';
import { PauseFormSchema } from '../schemas';

interface PersonPauseEditorInput {
  personId: number;
  firstName: string;
  membership: PersonMembership;
  pause: PersonPause | null;
}

export interface PersonPauseEditorControl {
  firstSessionYear: number | null;
  setFirstSessionYear: (value: number | null) => void;
  firstSessionYearError: string | undefined;
  lastSessionYear: number | null;
  setLastSessionYear: (value: number | null) => void;
  currentSessionYear: number;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  actionLabel: string;
  submit: () => void;
}

export const usePersonPauseEditor = ({
  personId,
  firstName,
  membership,
  pause,
}: PersonPauseEditorInput): PersonPauseEditorControl => {
  const currentSessionYearValue = sessionAt(new Date()).startYear;
  const create = useCreatePauseMutation(personId);
  const update = useUpdatePauseMutation(personId);

  const write = useWriteForm({
    schema: PauseFormSchema,
    defaults: {
      firstSessionYear: pause?.firstSessionYear ?? currentSessionYearValue,
      lastSessionYear: pause?.lastSessionYear ?? null,
    },
    mutate: (submitted) =>
      pause === null
        ? create
            .mutateAsync({ membershipId: membership.membershipId, ...submitted })
            .then((created) => created.pauseId)
        : update
            .mutateAsync({
              membershipId: membership.membershipId,
              pauseId: pause.pauseId,
              ...submitted,
            })
            .then(() => pause.pauseId),
    landing: (pauseId) => ({
      to: '/manage/persons/$personId/memberships/$membershipId',
      params: { personId, membershipId: membership.membershipId },
      mark: { kind: 'pause', id: pauseId },
    }),
  });
  const firstSessionYear = useController({ control: write.form.control, name: 'firstSessionYear' });
  const lastSessionYear = useController({ control: write.form.control, name: 'lastSessionYear' });

  const firstValue = firstSessionYear.field.value;
  const lastValue = lastSessionYear.field.value;

  return {
    firstSessionYear: firstValue,
    setFirstSessionYear: firstSessionYear.field.onChange,
    firstSessionYearError: write.form.formState.errors.firstSessionYear?.message,
    lastSessionYear: lastValue,
    setLastSessionYear: lastSessionYear.field.onChange,
    currentSessionYear: currentSessionYearValue,
    consequence: firstValue === null ? null : toPauseConsequence(firstName, firstValue, lastValue),
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    actionLabel: pause === null ? ADD_PAUSE_ACTION_LABEL : PAUSE_CHANGE_LABEL,
    submit: write.submit,
  };
};

import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { sessionAt } from '@/lib/club';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreatePauseMutation, useUpdatePauseMutation } from '../api';
import {
  ADD_PAUSE_ACTION_LABEL,
  PAUSE_CHANGE_LABEL,
  toPauseConsequence,
} from '../manage-persons-labels';
import type { CreatedPause, PersonMembership, PersonPause } from '../schemas';
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
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreatePauseMutation(personId);
  const update = useUpdatePauseMutation(personId);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(PauseFormSchema),
    defaultValues: {
      firstSessionYear: pause?.firstSessionYear ?? currentSessionYearValue,
      lastSessionYear: pause?.lastSessionYear ?? null,
    },
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;
  const firstSessionYear = useController({ control: form.control, name: 'firstSessionYear' });
  const lastSessionYear = useController({ control: form.control, name: 'lastSessionYear' });

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const landBack = (pauseId: number): void => {
    void navigate({
      to: '/manage/persons/$personId/memberships/$membershipId',
      params: { personId: String(personId), membershipId: String(membership.membershipId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('pause', pauseId) }),
      replace: true,
    });
  };

  const handleFormSubmit = form.handleSubmit((submitted) => {
    setRejection(null);

    if (pause === null) {
      create.mutate(
        { membershipId: membership.membershipId, ...submitted },
        { onSuccess: (created: CreatedPause) => landBack(created.pauseId), onError: fail },
      );

      return;
    }

    update.mutate(
      { membershipId: membership.membershipId, pauseId: pause.pauseId, ...submitted },
      { onSuccess: () => landBack(pause.pauseId), onError: fail },
    );
  });

  const firstValue = firstSessionYear.field.value;
  const lastValue = lastSessionYear.field.value;

  return {
    firstSessionYear: firstValue,
    setFirstSessionYear: firstSessionYear.field.onChange,
    firstSessionYearError: errors.firstSessionYear?.message,
    lastSessionYear: lastValue,
    setLastSessionYear: lastSessionYear.field.onChange,
    currentSessionYear: currentSessionYearValue,
    consequence: firstValue === null ? null : toPauseConsequence(firstName, firstValue, lastValue),
    rejection,
    isSaving: create.isPending || update.isPending,
    isDirty,
    canSubmit: isValid,
    actionLabel: pause === null ? ADD_PAUSE_ACTION_LABEL : PAUSE_CHANGE_LABEL,
    submit: () => {
      void handleFormSubmit();
    },
  };
};

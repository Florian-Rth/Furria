import { useState } from 'react';
import { sessionAt } from '@/lib/club';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreatePauseMutation, useUpdatePauseMutation } from '../api';
import { toPauseConsequence } from '../manage-persons-labels';
import type { PersonPause } from '../schemas';

interface PauseEditorInput {
  personId: number;
  membershipId: number;
  pause: PersonPause | null;
  firstName: string;
  onSaved: () => void;
}

export interface PauseEditorControl {
  firstSessionYear: number | null;
  setFirstSessionYear: (value: number | null) => void;
  lastSessionYear: number | null;
  setLastSessionYear: (value: number | null) => void;
  currentSessionYear: number;
  consequence: string;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const usePauseEditor = ({
  personId,
  membershipId,
  pause,
  firstName,
  onSaved,
}: PauseEditorInput): PauseEditorControl => {
  const currentSessionYear = sessionAt(new Date()).startYear;
  const [firstSessionYear, setFirstSessionYear] = useState<number | null>(
    pause?.firstSessionYear ?? currentSessionYear,
  );
  const [lastSessionYear, setLastSessionYear] = useState<number | null>(
    pause?.lastSessionYear ?? null,
  );
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreatePauseMutation(personId);
  const update = useUpdatePauseMutation(personId);

  const isSaving = create.isPending || update.isPending;

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const submit = (): void => {
    if (firstSessionYear === null) {
      return;
    }

    setRejection(null);

    if (pause === null) {
      create.mutate(
        { membershipId, firstSessionYear, lastSessionYear },
        { onSuccess: onSaved, onError: fail },
      );

      return;
    }

    update.mutate(
      { membershipId, pauseId: pause.pauseId, firstSessionYear, lastSessionYear },
      { onSuccess: onSaved, onError: fail },
    );
  };

  return {
    firstSessionYear,
    setFirstSessionYear,
    lastSessionYear,
    setLastSessionYear,
    currentSessionYear,
    consequence:
      firstSessionYear === null
        ? ''
        : toPauseConsequence(firstName, firstSessionYear, lastSessionYear),
    rejection,
    isSaving,
    canSubmit: firstSessionYear !== null && !isSaving,
    submit,
  };
};

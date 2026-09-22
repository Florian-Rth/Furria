import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
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

interface PersonPauseEditorInput {
  personId: number;
  firstName: string;
  membership: PersonMembership;
  pause: PersonPause | null;
}

export interface PersonPauseEditorControl {
  firstSessionYear: number | null;
  setFirstSessionYear: (value: number | null) => void;
  lastSessionYear: number | null;
  setLastSessionYear: (value: number | null) => void;
  currentSessionYear: number;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
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
  const initialFirst = pause?.firstSessionYear ?? currentSessionYearValue;
  const initialLast = pause?.lastSessionYear ?? null;

  const [firstSessionYear, setFirstSessionYear] = useState<number | null>(initialFirst);
  const [lastSessionYear, setLastSessionYear] = useState<number | null>(initialLast);
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreatePauseMutation(personId);
  const update = useUpdatePauseMutation(personId);
  const navigate = useNavigate();

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

  const submit = (): void => {
    if (firstSessionYear === null) {
      return;
    }

    setRejection(null);

    if (pause === null) {
      create.mutate(
        { membershipId: membership.membershipId, firstSessionYear, lastSessionYear },
        { onSuccess: (created: CreatedPause) => landBack(created.pauseId), onError: fail },
      );

      return;
    }

    update.mutate(
      {
        membershipId: membership.membershipId,
        pauseId: pause.pauseId,
        firstSessionYear,
        lastSessionYear,
      },
      { onSuccess: () => landBack(pause.pauseId), onError: fail },
    );
  };

  return {
    firstSessionYear,
    setFirstSessionYear,
    lastSessionYear,
    setLastSessionYear,
    currentSessionYear: currentSessionYearValue,
    consequence:
      firstSessionYear === null
        ? null
        : toPauseConsequence(firstName, firstSessionYear, lastSessionYear),
    rejection,
    isSaving: create.isPending || update.isPending,
    isDirty: firstSessionYear !== initialFirst || lastSessionYear !== initialLast,
    actionLabel: pause === null ? ADD_PAUSE_ACTION_LABEL : PAUSE_CHANGE_LABEL,
    submit,
  };
};

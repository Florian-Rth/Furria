import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateMembershipMutation, useUpdateMembershipMutation } from '../api';
import {
  ADD_MEMBERSHIP_ACTION_LABEL,
  MEMBERSHIP_CHANGE_LABEL,
  MEMBERSHIP_END_LABEL,
  toEndMembershipConsequence,
  toMembershipConsequence,
  toOpenPause,
} from '../manage-persons-labels';
import type { CreatedMembership, PersonDetails, PersonMembership } from '../schemas';

interface PersonMembershipEditorInput {
  person: PersonDetails;
  membership: PersonMembership | null;
}

export interface PersonMembershipEditorControl {
  startedOn: string | null;
  setStartedOn: (value: string | null) => void;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  actionLabel: string;
  actionTone: 'danger' | undefined;
  submit: () => void;
}

export const usePersonMembershipEditor = ({
  person,
  membership,
}: PersonMembershipEditorInput): PersonMembershipEditorControl => {
  const today = toIsoDay(new Date());
  const initialStartedOn = membership?.startedOn ?? today;
  const initialEndedOn = membership?.endedOn ?? null;
  const wasOpen = membership !== null && membership.endedOn === null;

  const [startedOn, setStartedOn] = useState<string | null>(initialStartedOn);
  const [endedOn, setEndedOn] = useState<string | null>(initialEndedOn);
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateMembershipMutation(person.personId);
  const update = useUpdateMembershipMutation(person.personId);
  const navigate = useNavigate();

  const isClosingNow = wasOpen && endedOn !== null;

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const landBack = (membershipId: number): void => {
    void navigate({
      to: '/manage/persons/$personId',
      params: { personId: String(person.personId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('membership', membershipId) }),
      replace: true,
    });
  };

  const submit = (): void => {
    if (startedOn === null) {
      return;
    }

    setRejection(null);

    if (membership === null) {
      create.mutate(
        { startedOn, endedOn },
        {
          onSuccess: (created: CreatedMembership) => landBack(created.membershipId),
          onError: fail,
        },
      );

      return;
    }

    update.mutate(
      { membershipId: membership.membershipId, startedOn, endedOn, wasOpen },
      { onSuccess: () => landBack(membership.membershipId), onError: fail },
    );
  };

  const consequence =
    startedOn === null
      ? null
      : isClosingNow && endedOn !== null && membership !== null
        ? toEndMembershipConsequence(person.firstName, endedOn, toOpenPause(membership) !== null)
        : toMembershipConsequence(startedOn, endedOn, today);

  return {
    startedOn,
    setStartedOn,
    endedOn,
    setEndedOn,
    consequence,
    rejection,
    isSaving: create.isPending || update.isPending,
    isDirty: startedOn !== initialStartedOn || endedOn !== initialEndedOn,
    actionLabel:
      membership === null
        ? ADD_MEMBERSHIP_ACTION_LABEL
        : isClosingNow
          ? MEMBERSHIP_END_LABEL
          : MEMBERSHIP_CHANGE_LABEL,
    actionTone: isClosingNow ? 'danger' : undefined,
    submit,
  };
};

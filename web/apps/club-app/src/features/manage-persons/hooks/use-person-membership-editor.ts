import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
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
import { MembershipFormSchema } from '../schemas';

interface PersonMembershipEditorInput {
  person: PersonDetails;
  membership: PersonMembership | null;
}

export interface PersonMembershipEditorControl {
  startedOn: string | null;
  setStartedOn: (value: string | null) => void;
  startedOnError: string | undefined;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  actionLabel: string;
  actionTone: 'danger' | undefined;
  submit: () => void;
}

export const usePersonMembershipEditor = ({
  person,
  membership,
}: PersonMembershipEditorInput): PersonMembershipEditorControl => {
  const today = toIsoDay(new Date());
  const wasOpen = membership !== null && membership.endedOn === null;

  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateMembershipMutation(person.personId);
  const update = useUpdateMembershipMutation(person.personId);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(MembershipFormSchema),
    defaultValues: {
      startedOn: membership?.startedOn ?? today,
      endedOn: membership?.endedOn ?? null,
    },
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;
  const startedOnField = useController({ control: form.control, name: 'startedOn' });
  const endedOnField = useController({ control: form.control, name: 'endedOn' });
  const startedOn = startedOnField.field.value;
  const endedOn = endedOnField.field.value;

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

  const handleFormSubmit = form.handleSubmit((submitted) => {
    setRejection(null);

    if (membership === null) {
      create.mutate(submitted, {
        onSuccess: (created: CreatedMembership) => landBack(created.membershipId),
        onError: fail,
      });

      return;
    }

    update.mutate(
      { membershipId: membership.membershipId, ...submitted, wasOpen },
      { onSuccess: () => landBack(membership.membershipId), onError: fail },
    );
  });

  const consequence =
    startedOn === null
      ? null
      : isClosingNow && endedOn !== null && membership !== null
        ? toEndMembershipConsequence(person.firstName, endedOn, toOpenPause(membership) !== null)
        : toMembershipConsequence(startedOn, endedOn, today);

  return {
    startedOn,
    setStartedOn: startedOnField.field.onChange,
    startedOnError: errors.startedOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    consequence,
    rejection,
    isSaving: create.isPending || update.isPending,
    isDirty,
    canSubmit: isValid,
    actionLabel:
      membership === null
        ? ADD_MEMBERSHIP_ACTION_LABEL
        : isClosingNow
          ? MEMBERSHIP_END_LABEL
          : MEMBERSHIP_CHANGE_LABEL,
    actionTone: isClosingNow ? 'danger' : undefined,
    submit: () => {
      void handleFormSubmit();
    },
  };
};

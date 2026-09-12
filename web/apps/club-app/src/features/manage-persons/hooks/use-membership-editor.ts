import { useState } from 'react';
import { toIsoDay } from '@/lib/day';
import { useCreateMembershipMutation, useUpdateMembershipMutation } from '../api';
import { toMembershipConsequence } from '../manage-persons-labels';
import { toWriteErrorMessage } from '../manage-persons-messages';
import type { PersonMembership } from '../schemas';

interface MembershipEditorInput {
  personId: number;
  membership: PersonMembership | null;
  onSaved: () => void;
}

export interface MembershipEditorControl {
  startedOn: string | null;
  setStartedOn: (value: string | null) => void;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useMembershipEditor = ({
  personId,
  membership,
  onSaved,
}: MembershipEditorInput): MembershipEditorControl => {
  const today = toIsoDay(new Date());
  const [startedOn, setStartedOn] = useState<string | null>(membership?.startedOn ?? today);
  const [endedOn, setEndedOn] = useState<string | null>(membership?.endedOn ?? null);
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateMembershipMutation(personId);
  const update = useUpdateMembershipMutation(personId);

  const isSaving = create.isPending || update.isPending;

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const submit = (): void => {
    if (startedOn === null) {
      return;
    }

    setRejection(null);

    if (membership === null) {
      create.mutate({ startedOn, endedOn }, { onSuccess: onSaved, onError: fail });

      return;
    }

    update.mutate(
      { membershipId: membership.membershipId, startedOn, endedOn },
      { onSuccess: onSaved, onError: fail },
    );
  };

  return {
    startedOn,
    setStartedOn,
    endedOn,
    setEndedOn,
    consequence: startedOn === null ? '' : toMembershipConsequence(startedOn, endedOn, today),
    rejection,
    isSaving,
    canSubmit: startedOn !== null && !isSaving,
    submit,
  };
};

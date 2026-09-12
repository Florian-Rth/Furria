import { useState } from 'react';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndMembershipMutation } from '../api';
import { toEndMembershipConsequence, toOpenPause } from '../manage-persons-labels';
import type { PersonMembership } from '../schemas';

interface EndMembershipFormInput {
  personId: number;
  membership: PersonMembership | null;
  open: boolean;
  firstName: string;
  onEnded: () => void;
}

export interface EndMembershipFormControl {
  membership: PersonMembership | null;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  hasOpenPause: boolean;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useEndMembershipForm = ({
  personId,
  membership,
  open,
  firstName,
  onEnded,
}: EndMembershipFormInput): EndMembershipFormControl => {
  const today = toIsoDay(new Date());
  const [shown, setShown] = useState<PersonMembership | null>(membership);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useEndMembershipMutation(personId);

  if (membership !== null && membership.membershipId !== shown?.membershipId) {
    setShown(membership);
    setEndedOn(today);
    setRejection(null);
  }
  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setEndedOn(today);
      setRejection(null);
    }
  }

  const hasOpenPause = shown !== null && toOpenPause(shown) !== null;

  const submit = (): void => {
    if (shown === null || endedOn === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { membershipId: shown.membershipId, endedOn },
      {
        onSuccess: onEnded,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    membership: shown,
    endedOn,
    setEndedOn,
    hasOpenPause,
    consequence:
      endedOn === null ? null : toEndMembershipConsequence(firstName, endedOn, hasOpenPause),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

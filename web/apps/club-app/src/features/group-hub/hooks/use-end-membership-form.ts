import { useState } from 'react';
import type { GroupDetailMember } from '@/features/group-detail';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndGroupMembershipMutation } from '../api';
import { toEndConsequence } from '../group-hub-labels';

interface EndMembershipFormInput {
  groupId: number;
  member: GroupDetailMember | null;
  open: boolean;
  onEnded: () => void;
}

export interface EndMembershipFormControl {
  member: GroupDetailMember | null;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useEndMembershipForm = ({
  groupId,
  member,
  open,
  onEnded,
}: EndMembershipFormInput): EndMembershipFormControl => {
  const today = toIsoDay(new Date());
  const [shown, setShown] = useState<GroupDetailMember | null>(member);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useEndGroupMembershipMutation(groupId);

  if (member !== null && member.groupMembershipId !== shown?.groupMembershipId) {
    setShown(member);
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

  const personName = shown === null ? '' : `${shown.firstName} ${shown.lastName}`;

  const submit = (): void => {
    if (shown === null || endedOn === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { groupMembershipId: shown.groupMembershipId, personName, endedOn },
      {
        onSuccess: onEnded,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    member: shown,
    endedOn,
    setEndedOn,
    consequence:
      shown === null || endedOn === null ? null : toEndConsequence(personName, endedOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

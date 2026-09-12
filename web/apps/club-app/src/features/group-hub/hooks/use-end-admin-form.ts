import { useState } from 'react';
import type { GroupDetailAdmin } from '@/features/group-detail';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndGroupAdminMutation } from '../api';
import { toAdminEndConsequence } from '../group-hub-labels';

interface EndAdminFormInput {
  groupId: number;
  groupName: string;
  admin: GroupDetailAdmin | null;
  isSelf: boolean;
  open: boolean;
  onEnded: () => void;
}

export interface EndAdminFormControl {
  admin: GroupDetailAdmin | null;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useEndAdminForm = ({
  groupId,
  groupName,
  admin,
  isSelf,
  open,
  onEnded,
}: EndAdminFormInput): EndAdminFormControl => {
  const today = toIsoDay(new Date());
  const [shown, setShown] = useState<GroupDetailAdmin | null>(admin);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useEndGroupAdminMutation(groupId);

  if (admin !== null && admin.groupAdminId !== shown?.groupAdminId) {
    setShown(admin);
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
      { groupAdminId: shown.groupAdminId, personName, groupName, isSelf, endedOn },
      {
        onSuccess: onEnded,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    admin: shown,
    endedOn,
    setEndedOn,
    consequence:
      shown === null || endedOn === null ? null : toAdminEndConsequence(personName, endedOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

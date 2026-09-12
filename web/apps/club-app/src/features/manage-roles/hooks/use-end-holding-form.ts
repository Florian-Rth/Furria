import { useState } from 'react';
import { toIsoDay } from '@/lib/day';
import { useEndRoleHoldingMutation } from '../api';
import { toEndHoldingConsequence, toPersonName } from '../manage-roles-labels';
import { toWriteErrorMessage } from '../manage-roles-messages';
import type { RoleHolder } from '../schemas';

interface EndHoldingFormInput {
  roleId: number;
  roleName: string;
  holder: RoleHolder | null;
  onEnded: () => void;
}

export interface EndHoldingFormControl {
  holder: RoleHolder | null;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useEndHoldingForm = ({
  roleId,
  roleName,
  holder,
  onEnded,
}: EndHoldingFormInput): EndHoldingFormControl => {
  const today = toIsoDay(new Date());
  const [shown, setShown] = useState<RoleHolder | null>(holder);
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useEndRoleHoldingMutation(roleId);

  if (holder !== null && holder.roleHoldingId !== shown?.roleHoldingId) {
    setShown(holder);
    setEndedOn(today);
    setRejection(null);
  }

  const submit = (): void => {
    if (shown === null || endedOn === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { roleHoldingId: shown.roleHoldingId, personName: toPersonName(shown), endedOn },
      {
        onSuccess: onEnded,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    holder: shown,
    endedOn,
    setEndedOn,
    consequence:
      shown === null || endedOn === null
        ? null
        : toEndHoldingConsequence(shown.firstName, roleName, endedOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

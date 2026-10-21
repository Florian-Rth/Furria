import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEndRoleHoldingMutation } from '../api';
import { toEndHoldingConsequence, toPersonName } from '../manage-roles-labels';
import type { RoleHolder, RoleSummary } from '../schemas';
import { RoleHoldingEndFormSchema } from '../schemas';

export interface HoldingEndingControl {
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  endedOnError: string | undefined;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useHoldingEnding = (
  role: Pick<RoleSummary, 'roleId' | 'name'>,
  holder: RoleHolder,
  today: string,
  onDone: () => void,
): HoldingEndingControl => {
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [tried, setTried] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useEndRoleHoldingMutation(role.roleId);
  const parsed = RoleHoldingEndFormSchema.safeParse({ endedOn });

  const submit = (): void => {
    setTried(true);
    setRejection(null);
    if (!parsed.success) {
      return;
    }

    void mutation
      .mutateAsync({
        roleHoldingId: holder.roleHoldingId,
        personName: toPersonName(holder),
        endedOn: parsed.data.endedOn,
      })
      .then(onDone, (error: Error) => {
        setRejection(toWriteErrorMessage(error));
      });
  };

  return {
    endedOn,
    setEndedOn,
    endedOnError: parsed.success || !tried ? undefined : parsed.error.issues[0]?.message,
    consequence:
      endedOn === null
        ? null
        : toEndHoldingConsequence(holder.firstName, role.name, endedOn, today),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

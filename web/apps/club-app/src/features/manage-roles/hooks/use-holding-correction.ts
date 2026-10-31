import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCorrectRoleHoldingMutation } from '../api';
import { toPersonName } from '../manage-roles-labels';
import type { RoleHolder, RoleSummary } from '../schemas';
import { RoleHoldingCorrectFormSchema } from '../schemas';

export interface HoldingCorrectionControl {
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  sinceOnError: string | undefined;
  untilOn: string | null;
  setUntilOn: (value: string | null) => void;
  untilOnError: string | undefined;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useHoldingCorrection = (
  role: Pick<RoleSummary, 'roleId'>,
  holder: RoleHolder,
  onDone: () => void,
): HoldingCorrectionControl => {
  const [sinceOn, setSinceOn] = useState<string | null>(holder.sinceOn);
  const [untilOn, setUntilOn] = useState<string | null>(holder.untilOn);
  const [tried, setTried] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useCorrectRoleHoldingMutation(role.roleId);
  const parsed = RoleHoldingCorrectFormSchema.safeParse({ sinceOn, untilOn });
  const issues = parsed.success || !tried ? [] : parsed.error.issues;
  const issueAt = (field: 'sinceOn' | 'untilOn'): string | undefined =>
    issues.find((issue) => issue.path[0] === field)?.message;

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
        sinceOn: parsed.data.sinceOn,
        untilOn: parsed.data.untilOn,
      })
      .then(onDone, (error: Error) => {
        setRejection(toWriteErrorMessage(error));
      });
  };

  return {
    sinceOn,
    setSinceOn,
    sinceOnError: issueAt('sinceOn'),
    untilOn,
    setUntilOn,
    untilOnError: issueAt('untilOn'),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};

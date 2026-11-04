import { useState } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useBeerListEnrollMutation, useBeerListLeaveMutation } from '../api';
import type { BeerListDialog } from '../profile-beer-list-labels';
import { toBeerListErrorMessage } from '../profile-messages';

export interface BeerListEnrollmentControl {
  isEnrolled: boolean;
  action: BeerListDialog;
  dialog: BeerListDialog;
  isAsking: boolean;
  ask: () => void;
  cancel: () => void;
  confirm: () => void;
  isSaving: boolean;
  error: string | undefined;
}

export const useBeerListEnrollment = (): BeerListEnrollmentControl => {
  const isEnrolled = usePermissions().has(PERMISSION_KEYS.beerListTake);
  const enroll = useBeerListEnrollMutation();
  const leave = useBeerListLeaveMutation();
  const action: BeerListDialog = isEnrolled ? 'leave' : 'enroll';
  const [dialog, setDialog] = useState<BeerListDialog>(action);
  const [isAsking, setIsAsking] = useState(false);
  const mutation = dialog === 'leave' ? leave : enroll;

  const ask = (): void => {
    enroll.reset();
    leave.reset();
    setDialog(action);
    setIsAsking(true);
  };

  const cancel = (): void => {
    setIsAsking(false);
  };

  const confirm = (): void => {
    mutation.mutate(undefined, { onSuccess: cancel });
  };

  return {
    isEnrolled,
    action,
    dialog,
    isAsking,
    ask,
    cancel,
    confirm,
    isSaving: mutation.isPending,
    error: toBeerListErrorMessage(mutation.error) ?? undefined,
  };
};

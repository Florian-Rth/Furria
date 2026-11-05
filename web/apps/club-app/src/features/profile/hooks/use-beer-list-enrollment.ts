import type { KkPanelAction } from '@furria/ui/panel-action';
import { useState } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useBeerListEnrollMutation, useBeerListLeaveMutation } from '../api';
import type { BeerListDialog, BeerListStateCopy } from '../profile-beer-list-labels';
import { BEER_LIST_STATES } from '../profile-beer-list-labels';
import { toBeerListErrorMessage } from '../profile-messages';

export interface BeerListDialogControl {
  askedAbout: BeerListDialog;
  isAsking: boolean;
  cancel: () => void;
  confirm: () => void;
  isSaving: boolean;
  error: string | undefined;
}

export interface BeerListEnrollmentControl {
  state: BeerListStateCopy;
  panelAction: KkPanelAction;
  dialog: BeerListDialogControl;
}

export const useBeerListEnrollment = (): BeerListEnrollmentControl => {
  const isEnrolled = usePermissions().has(PERMISSION_KEYS.beerListTake);
  const enroll = useBeerListEnrollMutation();
  const leave = useBeerListLeaveMutation();
  const state = BEER_LIST_STATES[isEnrolled ? 'enrolled' : 'notEnrolled'];
  const [askedAbout, setAskedAbout] = useState<BeerListDialog>('enroll');
  const [isAsking, setIsAsking] = useState(false);
  const mutation = askedAbout === 'leave' ? leave : enroll;

  const ask = (): void => {
    enroll.reset();
    leave.reset();
    setAskedAbout(isEnrolled ? 'leave' : 'enroll');
    setIsAsking(true);
  };

  const cancel = (): void => {
    setIsAsking(false);
  };

  const confirm = (): void => {
    mutation.mutate(undefined, { onSuccess: cancel });
  };

  return {
    state,
    panelAction: {
      label: state.actionLabel,
      icon: state.actionIcon,
      emphasis: state.actionEmphasis,
      onClick: ask,
    },
    dialog: {
      askedAbout,
      isAsking,
      cancel,
      confirm,
      isSaving: mutation.isPending,
      error: toBeerListErrorMessage(mutation.error) ?? undefined,
    },
  };
};

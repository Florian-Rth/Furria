import { useKkNotice } from '@furria/ui';
import { useState } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useDeclineMembershipApplicationMutation, useForgetMembershipApplication } from '../api';
import {
  ALREADY_DECIDED_MESSAGE,
  APPLICATIONS_PATH,
  toApplicantName,
} from '../manage-membership-applications-labels';
import type { MembershipApplicationDetails } from '../schemas';

export interface MembershipApplicationDeclineControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useMembershipApplicationDecline = (
  application: MembershipApplicationDetails,
): MembershipApplicationDeclineControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useDeclineMembershipApplicationMutation();
  const forgetApplication = useForgetMembershipApplication();
  const raiseNotice = useKkNotice();
  const goBackTo = useGoBackTo();

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const leave = (): void => {
    setIsOpen(false);
    void goBackTo({ to: APPLICATIONS_PATH, ignoreBlocker: true }).then(() => {
      forgetApplication(application.membershipApplicationId);
    });
  };

  const submit = (): void => {
    setRejection(null);
    mutation.mutate(
      {
        membershipApplicationId: application.membershipApplicationId,
        applicantName: toApplicantName(application),
      },
      {
        onSuccess: leave,
        onError: (error) => {
          if (isNotFoundError(error)) {
            raiseNotice({ tone: 'info', message: ALREADY_DECIDED_MESSAGE });
            leave();
            return;
          }

          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};

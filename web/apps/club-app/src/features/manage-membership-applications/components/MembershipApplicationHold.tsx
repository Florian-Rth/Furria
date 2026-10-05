import type { FC } from 'react';
import { AccessDenied, deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useMembershipApplicationQuery } from '../api';
import { toMembershipApplicationErrorMessage } from '../manage-membership-applications-messages';
import { MembershipApplicationError } from './MembershipApplicationError';
import { MembershipApplicationNotFound } from './MembershipApplicationNotFound';
import { MembershipApplicationSkeleton } from './MembershipApplicationSkeleton';

const DENIED_MESSAGE = deniedMessageOf(PERMISSION_KEYS.membershipApplicationsDecide);

interface MembershipApplicationHoldProps {
  membershipApplicationId: number | null;
}

export const MembershipApplicationHold: FC<MembershipApplicationHoldProps> = ({
  membershipApplicationId,
}) => {
  const application = useMembershipApplicationQuery(membershipApplicationId);
  const errorMessage = toMembershipApplicationErrorMessage(application.error);
  const isMissing = membershipApplicationId === null || isNotFoundError(application.error);

  const reload = (): void => {
    void application.refetch();
  };

  if (isMissing) {
    return <MembershipApplicationNotFound />;
  }
  if (isForbiddenError(application.error)) {
    return <AccessDenied message={DENIED_MESSAGE} />;
  }
  if (errorMessage !== null) {
    return <MembershipApplicationError message={errorMessage} onRetry={reload} />;
  }

  return <MembershipApplicationSkeleton />;
};

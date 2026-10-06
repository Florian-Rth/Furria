import type { FC } from 'react';
import { AccessDenied, AppListSkeleton, deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isForbiddenError } from '@/lib/query-error';
import { useMembershipApplicationsQuery } from '../api';
import { toMembershipApplicationsErrorMessage } from '../manage-membership-applications-messages';
import { MembershipApplicationsError } from './MembershipApplicationsError';
import { MembershipApplicationsView } from './MembershipApplicationsView';

const LOADING_LABEL = 'Die Beitrittsanträge werden geladen';
const DENIED_MESSAGE = deniedMessageOf(PERMISSION_KEYS.membershipApplicationsDecide);

export const MembershipApplicationsBody: FC = () => {
  const applications = useMembershipApplicationsQuery();
  const errorMessage = toMembershipApplicationsErrorMessage(applications.error);

  const reload = (): void => {
    void applications.refetch();
  };

  if (applications.data !== undefined) {
    return <MembershipApplicationsView applications={applications.data.applications} />;
  }
  if (isForbiddenError(applications.error)) {
    return <AccessDenied message={DENIED_MESSAGE} />;
  }
  if (errorMessage !== null) {
    return <MembershipApplicationsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};

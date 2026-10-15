import { KkEmptyState, KkRetryAlert, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleOverview } from '@/features/roles-overview';
import { CLUB_RETRY_LABEL, STALE_NOTE } from '../club-labels';
import { RoleOverviewBlock } from './RoleOverviewBlock';

const SKELETON_ROWS = 4;
const EMPTY_TITLE = 'KEINE ROLLEN';
const EMPTY_DESCRIPTION = 'Rollen werden unter „Rollen & Rechte“ vergeben.';

interface RolesSheetContentProps {
  roles: readonly RoleOverview[] | undefined;
  errorMessage: string | null;
  isRetrying: boolean;
  onRetry: () => void;
}

export const RolesSheetContent: FC<RolesSheetContentProps> = ({
  roles,
  errorMessage,
  isRetrying,
  onRetry,
}) => {
  if (roles === undefined && errorMessage !== null) {
    return (
      <KkRetryAlert
        message={errorMessage}
        retrying={isRetrying}
        onRetry={onRetry}
        retryLabel={CLUB_RETRY_LABEL}
      />
    );
  }
  if (roles === undefined) {
    return <KkSkeletonRow count={SKELETON_ROWS} />;
  }

  const blocks = roles.map((role) => <RoleOverviewBlock key={role.roleId} role={role} />);
  const empty =
    roles.length === 0 ? (
      <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
    ) : null;
  const staleNote =
    errorMessage === null ? null : (
      <KkRetryAlert
        severity="warning"
        message={STALE_NOTE}
        retrying={isRetrying}
        onRetry={onRetry}
        retryLabel={CLUB_RETRY_LABEL}
      />
    );

  return (
    <>
      {staleNote}
      {empty}
      {blocks}
    </>
  );
};

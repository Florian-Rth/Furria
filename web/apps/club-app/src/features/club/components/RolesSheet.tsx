import { KkSheet } from '@furria/ui';
import type { FC } from 'react';
import { toRolesOverviewErrorMessage, useRolesOverviewQuery } from '@/features/roles-overview';
import { RolesSheetContent } from './RolesSheetContent';

export const CLUB_ROLES_SHEET_ID = 'club-roles';

const SHEET_TITLE = 'Alle Rollen';
const CLOSE_LABEL = 'Schließen';

export const RolesSheet: FC = () => {
  const roles = useRolesOverviewQuery();
  const errorMessage = toRolesOverviewErrorMessage(roles.error);

  const retry = (): void => {
    void roles.refetch();
  };

  return (
    <KkSheet id={CLUB_ROLES_SHEET_ID} title={SHEET_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <RolesSheetContent
          roles={roles.data?.roles}
          errorMessage={errorMessage}
          isRetrying={roles.isFetching}
          onRetry={retry}
        />
      </KkSheet.Body>
    </KkSheet>
  );
};

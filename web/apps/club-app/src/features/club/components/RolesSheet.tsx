import { KkAlert, KkEmptyState, KkSheet, KkSkeletonRow } from '@furria/ui';
import type { FC } from 'react';
import { toRolesOverviewErrorMessage, useRolesOverviewQuery } from '@/features/roles-overview';
import { RoleOverviewBlock } from './RoleOverviewBlock';

export const CLUB_ROLES_SHEET_ID = 'club-roles';

const SHEET_TITLE = 'Alle Rollen';
const CLOSE_LABEL = 'Schließen';
const SKELETON_ROWS = 4;
const EMPTY_TITLE = 'KEINE ROLLEN';
const EMPTY_DESCRIPTION = 'Der Verein hat noch keine Rolle vergeben.';

export const RolesSheet: FC = () => {
  const roles = useRolesOverviewQuery();
  const errorMessage = toRolesOverviewErrorMessage(roles.error);
  const loaded = roles.data;

  const blocks =
    loaded === undefined
      ? null
      : loaded.roles.map((role) => <RoleOverviewBlock key={role.roleId} role={role} />);

  const empty =
    loaded !== undefined && loaded.roles.length === 0 ? (
      <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
    ) : null;

  const failure = errorMessage === null ? null : <KkAlert severity="error">{errorMessage}</KkAlert>;

  const skeleton =
    loaded === undefined && errorMessage === null ? <KkSkeletonRow count={SKELETON_ROWS} /> : null;

  return (
    <KkSheet id={CLUB_ROLES_SHEET_ID} title={SHEET_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        {skeleton}
        {failure}
        {empty}
        {blocks}
      </KkSheet.Body>
    </KkSheet>
  );
};

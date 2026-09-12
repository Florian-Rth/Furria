import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useRolesQuery } from '../api';
import { useSelectedRole } from '../hooks/use-selected-role';
import { MANAGE_ROLES_SECTION_TITLE } from '../manage-roles-labels';
import { toRolesErrorMessage } from '../manage-roles-messages';
import { RolesError } from './RolesError';
import { RolesView } from './RolesView';

const LOADING_LABEL = 'Rollen werden geladen';
const TOOLBAR_CHIPS = 3;
const DETAIL_SIZE = 8;

export const RolesBody: FC = () => {
  const roles = useRolesQuery();
  const { roleId } = useSelectedRole();
  const errorMessage = toRolesErrorMessage(roles.error);

  const reload = (): void => {
    void roles.refetch();
  };

  if (roles.data !== undefined) {
    return <RolesView roles={roles.data.roles} catalogue={roles.data.permissionKeys} />;
  }
  if (errorMessage !== null) {
    return <RolesError message={errorMessage} onRetry={reload} />;
  }

  return (
    <AppListSkeleton
      label={LOADING_LABEL}
      sectionTitle={MANAGE_ROLES_SECTION_TITLE}
      toolbarChips={TOOLBAR_CHIPS}
      listShape="cards"
      hasSelection={roleId !== null}
      asideSize={DETAIL_SIZE}
    />
  );
};

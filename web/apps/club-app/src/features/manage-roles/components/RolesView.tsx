import { KkButton, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import { AppListLayout } from '@/features/session';
import { useDetailScroll } from '../hooks/use-detail-scroll';
import { useRoleSearch } from '../hooks/use-role-search';
import { useSelectedRole } from '../hooks/use-selected-role';
import { MANAGE_ROLES_SECTION_TITLE, toRolesLead } from '../manage-roles-labels';
import type { RoleSummary } from '../schemas';
import { RoleColumn } from './RoleColumn';
import { RoleFormDialog } from './RoleFormDialog';
import { RolesCreateFab } from './RolesCreateFab';
import { RolesEmpty } from './RolesEmpty';
import { RolesGrid } from './RolesGrid';
import { RolesMasterList } from './RolesMasterList';
import { RolesToolbar } from './RolesToolbar';

const CREATE_LABEL = 'Rolle anlegen';
const DETAIL_SIZE = 8;

interface RolesViewProps {
  roles: readonly RoleSummary[];
  catalogue: readonly string[];
}

export const RolesView: FC<RolesViewProps> = ({ roles, catalogue }) => {
  const { roleId, select } = useSelectedRole();
  const search = useRoleSearch(roles);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const detailRef = useDetailScroll(roleId);

  const openCreate = (): void => {
    setCreateOpen(true);
  };

  const closeCreate = (): void => {
    setCreateOpen(false);
  };

  const handleCreated = (createdRoleId: number | null): void => {
    setCreateOpen(false);

    if (createdRoleId !== null) {
      select(createdRoleId);
    }
  };

  const createDialog = (
    <RoleFormDialog
      open={isCreateOpen}
      editedRole={null}
      onClose={closeCreate}
      onSaved={handleCreated}
    />
  );

  if (roles.length === 0) {
    return (
      <Stack sx={{ minWidth: 0 }}>
        <RolesEmpty onCreate={openCreate} />
        {createDialog}
      </Stack>
    );
  }

  const createButton = (
    <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={openCreate}>
      {CREATE_LABEL}
    </KkButton>
  );

  const list =
    roleId === null ? (
      <RolesGrid entries={search.entries} term={search.term} />
    ) : (
      <RolesMasterList
        entries={search.entries}
        term={search.term}
        selectedRoleId={roleId}
        onSelect={select}
      />
    );

  const detail = roleId === null ? undefined : <RoleColumn roleId={roleId} catalogue={catalogue} />;

  return (
    <>
      <AppListLayout
        lead={toRolesLead(roles)}
        sectionTitle={MANAGE_ROLES_SECTION_TITLE}
        createAction={createButton}
        toolbar={<RolesToolbar query={search.query} onQueryChange={search.setQuery} />}
        list={list}
        aside={detail}
        asideSize={DETAIL_SIZE}
        asideRef={detailRef}
      />
      <RolesCreateFab onCreate={openCreate} />
      {createDialog}
    </>
  );
};

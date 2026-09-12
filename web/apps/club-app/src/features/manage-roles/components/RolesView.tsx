import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import { useDetailScroll } from '../hooks/use-detail-scroll';
import { useSelectedRole } from '../hooks/use-selected-role';
import type { RoleSummary } from '../schemas';
import { RoleColumn } from './RoleColumn';
import { RoleFormDialog } from './RoleFormDialog';
import { RolesEmpty } from './RolesEmpty';
import { RolesMasterList } from './RolesMasterList';

interface RolesViewProps {
  roles: readonly RoleSummary[];
  catalogue: readonly string[];
}

export const RolesView: FC<RolesViewProps> = ({ roles, catalogue }) => {
  const { roleId, select } = useSelectedRole();
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

  return (
    <Stack sx={{ minWidth: 0 }}>
      <Grid container spacing={{ xs: 3, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, desktop: 4 }} sx={{ minWidth: 0 }}>
          <RolesMasterList
            roles={roles}
            selectedRoleId={roleId}
            onSelect={select}
            onCreate={openCreate}
          />
        </Grid>
        <Grid
          ref={detailRef}
          size={{ xs: 12, desktop: 8 }}
          sx={{ minWidth: 0, scrollMarginTop: 2 }}
        >
          <RoleColumn roleId={roleId} catalogue={catalogue} />
        </Grid>
      </Grid>
      {createDialog}
    </Stack>
  );
};

import type { KkStickyFootSurface } from '@furria/ui';
import { KkButton, KkIcon, KkStickyFoot } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { RolePaneControl } from '../hooks/use-role-pane';
import { isRoleArchived, primaryActionOf } from '../roles-hub';
import {
  ADD_HOLDER_LABEL,
  ARCHIVE_LABEL,
  EDIT_ROLE_LABEL,
  EDIT_ROLE_PATH,
  RESTORE_LABEL,
} from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';

const PAGE_RETURN = { from: 'role' } as const;

interface RolePaneFootProps {
  role: RoleSummary;
  control: RolePaneControl;
  surface: KkStickyFootSurface;
  onPage: boolean;
  onAdd: () => void;
}

export const RolePaneFoot: FC<RolePaneFootProps> = ({ role, control, surface, onPage, onAdd }) => {
  const primary = primaryActionOf(control.tab, role);
  const params = { roleId: String(role.roleId) };
  const search = onPage ? PAGE_RETURN : undefined;
  const addButton = (
    <KkButton
      variant="contained"
      fullWidth
      startIcon={<KkIcon name="add" size="small" />}
      onClick={onAdd}
    >
      {ADD_HOLDER_LABEL}
    </KkButton>
  );
  const editButton = (
    <KkButton
      variant="contained"
      fullWidth
      startIcon={<KkIcon name="edit" size="small" />}
      component={Link}
      to={EDIT_ROLE_PATH}
      params={params}
      search={search}
    >
      {EDIT_ROLE_LABEL}
    </KkButton>
  );
  const primaryButton =
    primary === 'addHolder' ? addButton : primary === 'edit' ? editButton : null;
  const lifecycle = isRoleArchived(role) ? (
    <KkButton size="small" variant="text" onClick={control.openRestore}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <KkButton size="small" variant="text" tone="danger" onClick={control.openArchive}>
      {ARCHIVE_LABEL}
    </KkButton>
  );

  return (
    <KkStickyFoot surface={surface}>
      {primaryButton}
      <Stack direction="row" sx={{ justifyContent: 'center', gap: 2 }}>
        {lifecycle}
      </Stack>
    </KkStickyFoot>
  );
};

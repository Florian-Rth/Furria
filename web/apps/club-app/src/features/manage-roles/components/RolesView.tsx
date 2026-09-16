import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useDetailScroll } from '../hooks/use-detail-scroll';
import type { RoleSearchControl } from '../hooks/use-role-search';
import { useSelectedRole } from '../hooks/use-selected-role';
import type { RoleSummary } from '../schemas';
import { RoleColumn } from './RoleColumn';
import { RolesEmpty } from './RolesEmpty';
import { RolesGrid } from './RolesGrid';
import { RolesMasterList } from './RolesMasterList';

const VIEW_GAP = 3;
const DETAIL_SCROLL_MARGIN = 2;

interface RolesViewProps {
  roles: readonly RoleSummary[];
  catalogue: readonly string[];
  search: RoleSearchControl;
  onCreate: () => void;
}

export const RolesView: FC<RolesViewProps> = ({ roles, catalogue, search, onCreate }) => {
  const { roleId, select } = useSelectedRole();
  const detailRef = useDetailScroll(roleId);

  if (roles.length === 0) {
    return <RolesEmpty onCreate={onCreate} />;
  }

  const list =
    roleId === null ? (
      <RolesGrid
        entries={search.entries}
        emptyDescription={search.emptyDescription}
        onSelect={select}
      />
    ) : (
      <RolesMasterList
        entries={search.entries}
        emptyDescription={search.emptyDescription}
        selectedRoleId={roleId}
      />
    );

  const detail =
    roleId === null ? null : (
      <Stack ref={detailRef} sx={{ minWidth: 0, scrollMarginTop: DETAIL_SCROLL_MARGIN }}>
        <RoleColumn roleId={roleId} catalogue={catalogue} />
      </Stack>
    );

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      {list}
      {detail}
    </Stack>
  );
};

import type { KkPanelAction } from '@furria/ui';
import { KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
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
const LIST_TITLE = 'Rollen';
const ADD_TEXT = 'Rolle';
const ADD_ACTION_LABEL = 'Rolle hinzufügen';
const NEW_ROUTE = '/manage/roles/new';

const ADD_ACTION: KkPanelAction = {
  label: ADD_TEXT,
  icon: 'add',
  ariaLabel: ADD_ACTION_LABEL,
  component: Link,
  to: NEW_ROUTE,
};

interface RolesViewProps {
  roles: readonly RoleSummary[];
  catalogue: readonly string[];
  search: RoleSearchControl;
}

export const RolesView: FC<RolesViewProps> = ({ roles, catalogue, search }) => {
  const { roleId, select } = useSelectedRole();
  const detailRef = useDetailScroll(roleId);

  if (roles.length === 0) {
    return <RolesEmpty />;
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
      <KkPanelSection title={LIST_TITLE} action={ADD_ACTION}>
        {list}
      </KkPanelSection>
      {detail}
    </Stack>
  );
};

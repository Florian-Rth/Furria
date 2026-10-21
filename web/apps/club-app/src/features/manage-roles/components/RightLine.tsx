import { KkFactLine, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toPermissionCopy } from '../role-permission-copy';
import type { RightEntry } from '../roles-hub';
import { NO_HOLDER_ROLE } from '../roles-hub-copy';
import type { RolePaneTab } from '../schemas';
import { RightRoleChip } from './RightRoleChip';

interface RightLineProps {
  entry: RightEntry;
  selectedId: number | null;
  onOpen: (roleId: number, tab?: RolePaneTab) => void;
}

export const RightLine: FC<RightLineProps> = ({ entry, selectedId, onOpen }) => {
  const { title } = toPermissionCopy(entry.key);
  const chips = entry.roles.map((role) => (
    <RightRoleChip
      key={role.roleId}
      role={role}
      selected={role.roleId === selectedId}
      onOpen={onOpen}
    />
  ));
  const granted =
    chips.length === 0 ? (
      <KkMeta component="span">{NO_HOLDER_ROLE}</KkMeta>
    ) : (
      <Stack
        direction="row"
        sx={{ gap: 0.5, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
      >
        {chips}
      </Stack>
    );

  return <KkFactLine label={title} value={granted} stackOnPhone />;
};

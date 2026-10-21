import { KkFactLine, KkIcon, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RolePermissionEntry } from '../manage-roles-labels';
import { NO_GRANTED_NOTE } from '../roles-hub-copy';

interface RoleGrantedListProps {
  entries: readonly RolePermissionEntry[];
}

export const RoleGrantedList: FC<RoleGrantedListProps> = ({ entries }) => {
  const granted = entries.filter((entry) => entry.enabled);

  if (granted.length === 0) {
    return <KkMeta>{NO_GRANTED_NOTE}</KkMeta>;
  }

  const lines = granted.map((entry) => (
    <KkFactLine key={entry.key} label={entry.title} value={<KkIcon name="check" size="small" />} />
  ));

  return <Stack sx={{ gap: 0, minWidth: 0 }}>{lines}</Stack>;
};

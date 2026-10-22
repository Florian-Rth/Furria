import { KkQuietFold } from '@furria/ui/KkQuietFold';
import { KkRoster } from '@furria/ui/KkRoster';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useFold } from '../hooks/use-fold';
import {
  ARCHIVED_FOLD,
  ARCHIVED_LABEL,
  ARCHIVED_LIST_ID,
  HIDE_LABEL,
  SHOW_LABEL,
} from '../roles-hub-copy';
import type { RolePaneTab, RoleSummary } from '../schemas';
import { RoleArchivedLine } from './RoleArchivedLine';

interface RolesArchivedProps {
  roles: readonly RoleSummary[];
  compact: boolean;
  selectedId: number | null;
  highlightedKey: string | null;
  onOpen: (roleId: number, tab?: RolePaneTab) => void;
}

export const RolesArchived: FC<RolesArchivedProps> = ({
  roles,
  compact,
  selectedId,
  highlightedKey,
  onOpen,
}) => {
  const fold = useFold();

  if (roles.length === 0) {
    return null;
  }

  const lines = roles.flatMap((role) =>
    role.archivedOn === null
      ? []
      : [
          <RoleArchivedLine
            highlightedKey={highlightedKey}
            key={role.roleId}
            role={role}
            archivedOn={role.archivedOn}
            selected={selectedId === role.roleId}
            compact={compact}
            onOpen={onOpen}
          />,
        ],
  );
  const toggleLabel = fold.open ? HIDE_LABEL : SHOW_LABEL;
  const roster = fold.open ? (
    <KkRoster label={ARCHIVED_LABEL} id={ARCHIVED_LIST_ID} compact={compact}>
      {lines}
    </KkRoster>
  ) : null;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkQuietFold
        label={ARCHIVED_FOLD}
        count={roles.length}
        toggleLabel={toggleLabel}
        open={fold.open}
        controls={ARCHIVED_LIST_ID}
        onToggle={fold.toggle}
      />
      {roster}
    </Stack>
  );
};

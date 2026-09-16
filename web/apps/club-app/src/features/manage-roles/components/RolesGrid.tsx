import { KkEmptyState, KkPanel } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { NO_ROLE_SEARCH_RESULT_TITLE } from '../manage-roles-labels';
import { RoleCard } from './RoleCard';

const CARD_SIZE = { xs: 12, sm: 6, desktop: 4 };

interface RolesGridProps {
  entries: readonly RoleMasterEntry[];
  emptyDescription: string;
  onSelect: (roleId: number) => void;
}

export const RolesGrid: FC<RolesGridProps> = ({ entries, emptyDescription, onSelect }) => {
  if (entries.length === 0) {
    return (
      <KkPanel variant="block">
        <KkEmptyState title={NO_ROLE_SEARCH_RESULT_TITLE} description={emptyDescription} />
      </KkPanel>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
      {entries.map((entry) => (
        <Grid key={entry.roleId} size={CARD_SIZE} sx={{ minWidth: 0 }}>
          <RoleCard
            entry={entry}
            onSelect={() => {
              onSelect(entry.roleId);
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

import { KkEmptyState, KkPanel } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { NO_ROLE_SEARCH_RESULT_TITLE, toNoRoleSearchResultLine } from '../manage-roles-labels';
import { RoleCard } from './RoleCard';

const CARD_SIZE = { xs: 12, desktop: 4 };

interface RolesGridProps {
  entries: readonly RoleMasterEntry[];
  term: string | null;
}

export const RolesGrid: FC<RolesGridProps> = ({ entries, term }) => {
  if (entries.length === 0) {
    return (
      <KkPanel variant="block">
        <KkEmptyState
          title={NO_ROLE_SEARCH_RESULT_TITLE}
          description={toNoRoleSearchResultLine(term ?? '')}
        />
      </KkPanel>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
      {entries.map((entry) => (
        <Grid key={entry.roleId} size={CARD_SIZE} sx={{ minWidth: 0 }}>
          <RoleCard entry={entry} />
        </Grid>
      ))}
    </Grid>
  );
};

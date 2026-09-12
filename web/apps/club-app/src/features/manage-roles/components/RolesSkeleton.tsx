import {
  KkPanel,
  KkPanelHeader,
  KkSkeletonBlock,
  KkSkeletonRow,
  KkSkeletonToolbar,
  KkStickyBar,
} from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MANAGE_ROLES_SECTION_TITLE } from '../manage-roles-labels';

const MASTER_ROWS = 8;
const LEAD_LINES = 2;
const DETAIL_LINES = 5;
const CARD_LINES = 4;
const CARD_KEYS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const;
const NO_TOOLBAR_CHIPS = 0;
const LOADING_LABEL = 'Rollen werden geladen';
const FULL_HEIGHT = { height: '100%' } as const;
const FULL_WIDTH = 12;
const SPLIT_MASTER_SIZE = 4;

interface RolesSkeletonProps {
  hasSelection: boolean;
}

export const RolesSkeleton: FC<RolesSkeletonProps> = ({ hasSelection }) => {
  const mainSize = hasSelection ? SPLIT_MASTER_SIZE : FULL_WIDTH;

  const main = hasSelection ? (
    <KkPanel variant="list">
      <KkSkeletonRow count={MASTER_ROWS} shape="select" />
    </KkPanel>
  ) : (
    <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
      {CARD_KEYS.map((key) => (
        <Grid key={key} size={{ xs: 12, desktop: 4 }} sx={{ minWidth: 0 }}>
          <KkPanel variant="block" sx={FULL_HEIGHT}>
            <KkSkeletonBlock lines={CARD_LINES} />
          </KkPanel>
        </Grid>
      ))}
    </Grid>
  );

  const detail = hasSelection ? (
    <Grid size={{ xs: 12, desktop: 8 }} sx={{ minWidth: 0 }}>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={DETAIL_LINES} />
      </KkPanel>
    </Grid>
  ) : null;

  return (
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkSkeletonBlock lines={LEAD_LINES} />
      <Grid container spacing={{ xs: 3.5, desktop: 5 }} sx={{ minWidth: 0 }}>
        <Grid size={{ xs: 12, desktop: mainSize }} sx={{ minWidth: 0 }}>
          <Stack sx={{ gap: 1.5, minWidth: 0 }}>
            <KkPanelHeader title={MANAGE_ROLES_SECTION_TITLE} />
            <KkStickyBar>
              <KkSkeletonToolbar chips={NO_TOOLBAR_CHIPS} />
            </KkStickyBar>
            {main}
          </Stack>
        </Grid>
        {detail}
      </Grid>
    </AppSkeletonRegion>
  );
};

import { KkPanel, KkSkeletonBlock, KkSkeletonRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from './AppSkeletonRegion';

export type AppListSkeletonShape = 'rows' | 'cards';

const ROW_COUNT = 8;
const MASTER_ROW_COUNT = 6;
const DETAIL_LINES = 5;
const CARD_LINES = 4;
const CARD_SIZE = { xs: 12, sm: 6, desktop: 4 };
const CARD_KEYS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const;
const FULL_HEIGHT = { height: '100%' } as const;

interface AppListSkeletonProps {
  label: string;
  listShape: AppListSkeletonShape;
  hasSelection?: boolean;
}

const cardGrid = (
  <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
    {CARD_KEYS.map((key) => (
      <Grid key={key} size={CARD_SIZE} sx={{ minWidth: 0 }}>
        <KkPanel variant="block" sx={FULL_HEIGHT}>
          <KkSkeletonBlock lines={CARD_LINES} />
        </KkPanel>
      </Grid>
    ))}
  </Grid>
);

const detailPanel = (
  <KkPanel variant="block">
    <KkSkeletonBlock lines={DETAIL_LINES} />
  </KkPanel>
);

const masterRows = (
  <KkPanel variant="list">
    <KkSkeletonRow count={MASTER_ROW_COUNT} shape="select" />
  </KkPanel>
);

const plainRows = (
  <KkPanel variant="list">
    <KkSkeletonRow count={ROW_COUNT} />
  </KkPanel>
);

export const AppListSkeleton: FC<AppListSkeletonProps> = ({
  label,
  listShape,
  hasSelection = false,
}) => {
  const listRows = hasSelection ? masterRows : plainRows;
  const list = !hasSelection && listShape === 'cards' ? cardGrid : listRows;
  const detail = hasSelection ? detailPanel : null;

  return (
    <AppSkeletonRegion label={label}>
      {list}
      {detail}
    </AppSkeletonRegion>
  );
};

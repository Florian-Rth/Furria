import { KkPanel, KkSkeletonBlock, KkSkeletonRow, KkStickyBar, KkStickyRail } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MemberSearch } from '../hooks/use-member-search';
import { MembersToolbar } from './MembersToolbar';

const SKELETON_ROWS = 8;
const INTRO_LINES = 2;
const INDEX_LINES = 3;
const STATS_LINES = 4;
const LOADING_LABEL = 'Mitgliederliste wird geladen';

interface MembersSkeletonProps {
  search: MemberSearch;
}

export const MembersSkeleton: FC<MembersSkeletonProps> = ({ search }) => (
  <Stack role="status" aria-busy aria-label={LOADING_LABEL} sx={{ gap: 3, minWidth: 0 }}>
    <KkSkeletonBlock lines={INTRO_LINES} />
    <Grid container spacing={{ xs: 3, desktop: 5 }} sx={{ minWidth: 0 }}>
      <Grid size={{ xs: 12, desktop: 8 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ minWidth: 0 }}>
          <KkStickyBar>
            <MembersToolbar
              query={search.query}
              onQueryChange={search.setQuery}
              state={search.state}
              options={search.filterOptions}
              onStateChange={search.selectState}
              letters={search.letters}
              letter={search.letter}
              onLetterSelect={search.jumpTo}
            />
          </KkStickyBar>
          <KkSkeletonRow count={SKELETON_ROWS} />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, desktop: 4 }} sx={{ display: { xs: 'none', desktop: 'block' } }}>
        <KkStickyRail>
          <Stack sx={{ gap: 3.5, minWidth: 0 }}>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={INDEX_LINES} />
            </KkPanel>
            <KkPanel variant="block">
              <KkSkeletonBlock lines={STATS_LINES} />
            </KkPanel>
          </Stack>
        </KkStickyRail>
      </Grid>
    </Grid>
  </Stack>
);

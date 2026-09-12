import { KkStickyBar, KkStickyRail } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MemberSearch } from '../hooks/use-member-search';
import { MembersAside } from './MembersAside';
import { MembersEmpty } from './MembersEmpty';
import { MembersIntro } from './MembersIntro';
import { MembersList } from './MembersList';
import { MembersToolbar } from './MembersToolbar';

interface MembersViewProps {
  search: MemberSearch;
}

export const MembersView: FC<MembersViewProps> = ({ search }) => {
  const list =
    search.visibleCount === 0 ? (
      <MembersEmpty query={search.query} />
    ) : (
      <MembersList sections={search.sections} />
    );

  return (
    <Stack sx={{ gap: 3, minWidth: 0 }}>
      <MembersIntro total={search.total} withoutMembership={search.totals.none} />
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
            {list}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, desktop: 4 }} sx={{ display: { xs: 'none', desktop: 'block' } }}>
          <KkStickyRail>
            <MembersAside
              letters={search.letters}
              letter={search.letter}
              onLetterSelect={search.jumpTo}
              totals={search.totals}
            />
          </KkStickyRail>
        </Grid>
      </Grid>
    </Stack>
  );
};

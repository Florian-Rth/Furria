import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useMemberSearch } from '../hooks/use-member-search';
import type { MemberSummary } from '../schemas';
import { MembersAside } from './MembersAside';
import { MembersEmpty } from './MembersEmpty';
import { MembersIntro } from './MembersIntro';
import { MembersList } from './MembersList';
import { MembersToolbar } from './MembersToolbar';

interface MembersViewProps {
  members: readonly MemberSummary[];
}

export const MembersView: FC<MembersViewProps> = ({ members }) => {
  const search = useMemberSearch(members);

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
          <Stack sx={{ gap: 2.5, minWidth: 0 }}>
            <MembersToolbar
              query={search.query}
              onQueryChange={search.setQuery}
              state={search.state}
              options={search.filterOptions}
              onStateChange={search.selectState}
            />
            {list}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, desktop: 4 }} sx={{ display: { xs: 'none', desktop: 'block' } }}>
          <MembersAside
            letters={search.letters}
            letter={search.letter}
            onLetterSelect={search.jumpTo}
            totals={search.totals}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

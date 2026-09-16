import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MemberSearch } from '../hooks/use-member-search';
import { toStatsFootnote } from '../members-labels';
import { MembersEmpty } from './MembersEmpty';
import { MembersList } from './MembersList';
import { MembersStats } from './MembersStats';

const VIEW_GAP = 3.5;

interface MembersViewProps {
  search: MemberSearch;
}

export const MembersView: FC<MembersViewProps> = ({ search }) => {
  const footnote = toStatsFootnote(search.totals.none);

  const list =
    search.visibleCount === 0 ? (
      <MembersEmpty query={search.query} state={search.state} />
    ) : (
      <MembersList sections={search.sections} />
    );

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      {list}
      <MembersStats totals={search.totals} note={footnote} />
    </Stack>
  );
};

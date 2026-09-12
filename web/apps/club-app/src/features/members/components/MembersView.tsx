import type { FC } from 'react';
import { AppListLayout } from '@/features/session';
import type { MemberSearch } from '../hooks/use-member-search';
import { MEMBERS_SECTION_TITLE, toConnectedSentence, toStatsFootnote } from '../members-labels';
import { MembersAside } from './MembersAside';
import { MembersEmpty } from './MembersEmpty';
import { MembersLetterRail } from './MembersLetterRail';
import { MembersList } from './MembersList';
import { MembersToolbar } from './MembersToolbar';

const ASIDE_SIZE = 4;

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

  const toolbar = (
    <MembersToolbar
      query={search.query}
      onQueryChange={search.setQuery}
      state={search.state}
      options={search.filterOptions}
      onStateChange={search.selectState}
    />
  );

  const letterRail = (
    <MembersLetterRail
      letters={search.letters}
      letter={search.letter}
      onLetterSelect={search.jumpTo}
    />
  );

  const aside = (
    <MembersAside
      letters={search.letters}
      letter={search.letter}
      onLetterSelect={search.jumpTo}
      totals={search.totals}
      note={footnote}
    />
  );

  return (
    <AppListLayout
      lead={toConnectedSentence(search.total)}
      asideNote={footnote}
      sectionTitle={MEMBERS_SECTION_TITLE}
      toolbar={toolbar}
      letterRail={letterRail}
      list={list}
      aside={aside}
      asideSize={ASIDE_SIZE}
      asideDesktopOnly
      stickyAside
      asideLeadsFocus
    />
  );
};

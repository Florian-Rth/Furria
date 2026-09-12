import type { FC } from 'react';
import { AppListLayout } from '@/features/session';
import type { MemberSearch } from '../hooks/use-member-search';
import { MEMBERS_SECTION_TITLE, toConnectedSentence } from '../members-labels';
import { MembersAside } from './MembersAside';
import { MembersEmpty } from './MembersEmpty';
import { MembersIntro } from './MembersIntro';
import { MembersList } from './MembersList';
import { MembersToolbar } from './MembersToolbar';

const ASIDE_SIZE = 4;

interface MembersViewProps {
  search: MemberSearch;
}

export const MembersView: FC<MembersViewProps> = ({ search }) => {
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
    />
  );

  return (
    <AppListLayout
      lead={toConnectedSentence(search.total)}
      subLead={<MembersIntro withoutMembership={search.totals.none} />}
      sectionTitle={MEMBERS_SECTION_TITLE}
      toolbar={toolbar}
      list={list}
      aside={aside}
      asideSize={ASIDE_SIZE}
      asideDesktopOnly
      stickyAside
      asideLeadsFocus
    />
  );
};

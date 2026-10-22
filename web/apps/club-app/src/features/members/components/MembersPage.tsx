import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonToolbar } from '@furria/ui/KkSkeletonToolbar';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { KkScreenIndex } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { AREA_HANDOVERS, CLUB_ORIGIN } from '@/features/session/app-sections';
import { useScreenSearch } from '@/features/session/hooks/use-screen-search';
import { useMembersQuery } from '../api';
import { useMemberSearch } from '../hooks/use-member-search';
import { LETTER_INDEX_LABEL, MEMBERS_LEAD } from '../members-labels';
import type { MemberSummary } from '../schemas';
import { MembersBody } from './MembersBody';
import { MembersToolbar } from './MembersToolbar';

const MEMBERS_TITLE = 'Mitglieder';

const SEARCH_PLACEHOLDER = 'Name, Gruppe oder Rolle';

const TOOLBAR_CHIPS = 5;

const NO_MEMBERS: readonly MemberSummary[] = [];

export const MembersPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const members = useMembersQuery();
  const rows = members.data?.members ?? NO_MEMBERS;
  const search = useMemberSearch(rows);

  const index: KkScreenIndex | undefined =
    search.letters.length === 0
      ? undefined
      : {
          label: LETTER_INDEX_LABEL,
          letters: search.letters,
          current: search.letter,
          onSelect: search.jumpTo,
        };

  const toolbar =
    members.data === undefined ? undefined : (
      <MembersToolbar
        state={search.state}
        options={search.filterOptions}
        onStateChange={search.selectState}
      />
    );

  const tools = members.isPending ? <KkSkeletonToolbar chips={TOOLBAR_CHIPS} /> : toolbar;

  return (
    <KkScreen
      kind="list"
      search={searchMode}
      tools={tools}
      index={index}
      title={MEMBERS_TITLE}
      origin={CLUB_ORIGIN}
      header={<KkTitleHeader title={MEMBERS_TITLE} lead={MEMBERS_LEAD} />}
      handover={AREA_HANDOVERS.members}
    >
      <MembersBody search={search} />
    </KkScreen>
  );
};

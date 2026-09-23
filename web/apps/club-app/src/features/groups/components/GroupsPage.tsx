import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN, useScreenSearch } from '@/features/session';
import { useGroupsQuery } from '../api';
import { GROUPS_LEAD } from '../groups-labels';
import { useGroupsSearch } from '../hooks/use-groups-search';
import type { GroupSummary } from '../schemas';
import { GroupsBody } from './GroupsBody';
import { GroupsToolbar } from './GroupsToolbar';

const GROUPS_TITLE = 'Gruppen';

const SEARCH_PLACEHOLDER = 'Name der Gruppe';

const TOOLBAR_CHIPS = 3;

const NO_GROUPS: readonly GroupSummary[] = [];

export const GroupsPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const groups = useGroupsQuery();
  const rows = groups.data?.groups ?? NO_GROUPS;
  const search = useGroupsSearch(rows);

  const toolbar =
    groups.data === undefined ? undefined : (
      <GroupsToolbar
        status={search.status}
        options={search.filterOptions}
        onStatusChange={search.selectStatus}
      />
    );

  const tools = groups.isPending ? <KkSkeletonToolbar chips={TOOLBAR_CHIPS} /> : toolbar;

  return (
    <KkScreen
      kind="list"
      search={searchMode}
      tools={tools}
      title={GROUPS_TITLE}
      origin={CLUB_ORIGIN}
      header={<KkTitleHeader title={GROUPS_TITLE} lead={GROUPS_LEAD} />}
    >
      <GroupsBody search={search} />
    </KkScreen>
  );
};

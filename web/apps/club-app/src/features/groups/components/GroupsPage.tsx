import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN, useScreenSearch } from '@/features/session';
import { useGroupsQuery } from '../api';
import { toGroupsLead } from '../groups-labels';
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
  const lead = groups.data === undefined ? undefined : toGroupsLead(rows);

  const tools =
    groups.data === undefined ? (
      <KkSkeletonToolbar chips={TOOLBAR_CHIPS} />
    ) : (
      <GroupsToolbar
        status={search.status}
        options={search.filterOptions}
        onStatusChange={search.selectStatus}
      />
    );

  return (
    <KkScreen
      kind="list"
      search={searchMode}
      tools={tools}
      title={GROUPS_TITLE}
      origin={CLUB_ORIGIN}
      header={<KkTitleHeader title={GROUPS_TITLE} lead={lead} />}
    >
      <GroupsBody search={search} />
    </KkScreen>
  );
};

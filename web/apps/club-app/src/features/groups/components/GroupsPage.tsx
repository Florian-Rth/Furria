import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonToolbar } from '@furria/ui/KkSkeletonToolbar';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, GROUPS_SECTION, GROUPS_TITLE } from '@/features/session/app-sections';
import { useScreenSearch } from '@/features/session/hooks/use-screen-search';
import { useGroupsQuery } from '../api';
import { GROUPS_LEAD } from '../groups-labels';
import { useGroupsSearch } from '../hooks/use-groups-search';
import type { GroupSummary } from '../schemas';
import { GroupsBody } from './GroupsBody';
import { GroupsToolbar } from './GroupsToolbar';

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
      section={GROUPS_SECTION}
      header={<KkTitleHeader title={GROUPS_TITLE} lead={GROUPS_LEAD} />}
      handover={AREA_HANDOVERS.groups}
    >
      <GroupsBody search={search} />
    </KkScreen>
  );
};

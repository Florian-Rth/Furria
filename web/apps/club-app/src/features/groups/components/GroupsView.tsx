import type { FC } from 'react';
import { AppListLayout } from '@/features/session';
import { GROUPS_SECTION_TITLE, toGroupsIntroSentence } from '../groups-labels';
import { useGroupStandings } from '../hooks/use-group-standings';
import { useGroupsSearch } from '../hooks/use-groups-search';
import type { GroupSummary } from '../schemas';
import { GroupsEmpty } from './GroupsEmpty';
import { GroupsGrid } from './GroupsGrid';
import { GroupsNoMatch } from './GroupsNoMatch';
import { GroupsToolbar } from './GroupsToolbar';

interface GroupsViewProps {
  groups: readonly GroupSummary[];
}

export const GroupsView: FC<GroupsViewProps> = ({ groups }) => {
  const standings = useGroupStandings();
  const search = useGroupsSearch(groups);
  const recruiting = groups.filter((group) => group.isRecruiting).length;

  if (groups.length === 0) {
    return <GroupsEmpty />;
  }

  const toolbar = (
    <GroupsToolbar
      query={search.query}
      onQueryChange={search.setQuery}
      status={search.status}
      options={search.filterOptions}
      onStatusChange={search.selectStatus}
    />
  );

  const list =
    search.visible.length === 0 ? (
      <GroupsNoMatch description={search.emptyDescription} />
    ) : (
      <GroupsGrid groups={search.visible} standings={standings} />
    );

  return (
    <AppListLayout
      lead={toGroupsIntroSentence(groups.length, recruiting)}
      sectionTitle={GROUPS_SECTION_TITLE}
      toolbar={toolbar}
      list={list}
    />
  );
};

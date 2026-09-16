import type { FC } from 'react';
import { useGroupStandings } from '../hooks/use-group-standings';
import type { GroupsSearch } from '../hooks/use-groups-search';
import type { GroupSummary } from '../schemas';
import { GroupsEmpty } from './GroupsEmpty';
import { GroupsGrid } from './GroupsGrid';
import { GroupsNoMatch } from './GroupsNoMatch';

interface GroupsViewProps {
  groups: readonly GroupSummary[];
  search: GroupsSearch;
}

export const GroupsView: FC<GroupsViewProps> = ({ groups, search }) => {
  const standings = useGroupStandings();

  if (groups.length === 0) {
    return <GroupsEmpty />;
  }
  if (search.visible.length === 0) {
    return <GroupsNoMatch description={search.emptyDescription} />;
  }

  return <GroupsGrid groups={search.visible} standings={standings} />;
};

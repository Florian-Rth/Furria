import type { FC } from 'react';
import type { GroupsSearch } from '../hooks/use-groups-search';
import type { GroupSummary } from '../schemas';
import { GroupsEmpty } from './GroupsEmpty';
import { GroupsNoMatch } from './GroupsNoMatch';
import { GroupsRack } from './GroupsRack';

interface GroupsViewProps {
  groups: readonly GroupSummary[];
  search: GroupsSearch;
}

export const GroupsView: FC<GroupsViewProps> = ({ groups, search }) => {
  if (groups.length === 0) {
    return <GroupsEmpty />;
  }
  if (search.sections.length === 0) {
    return <GroupsNoMatch description={search.emptyDescription} />;
  }

  return <GroupsRack sections={search.sections} />;
};

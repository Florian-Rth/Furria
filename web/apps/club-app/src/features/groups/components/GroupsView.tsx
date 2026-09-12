import type { FC } from 'react';
import { AppListLayout } from '@/features/session';
import { GROUPS_SECTION_TITLE, toGroupsIntroSentence } from '../groups-labels';
import { useGroupStandings } from '../hooks/use-group-standings';
import type { GroupSummary } from '../schemas';
import { GroupsEmpty } from './GroupsEmpty';
import { GroupsGrid } from './GroupsGrid';

interface GroupsViewProps {
  groups: readonly GroupSummary[];
}

export const GroupsView: FC<GroupsViewProps> = ({ groups }) => {
  const standings = useGroupStandings();
  const recruiting = groups.filter((group) => group.isRecruiting).length;

  if (groups.length === 0) {
    return <GroupsEmpty />;
  }

  return (
    <AppListLayout
      lead={toGroupsIntroSentence(groups.length, recruiting)}
      sectionTitle={GROUPS_SECTION_TITLE}
      list={<GroupsGrid groups={groups} standings={standings} />}
    />
  );
};

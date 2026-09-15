import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN, useScreenSearch } from '@/features/session';
import { useGroupsQuery } from '../api';
import { toGroupsLead } from '../groups-labels';
import { GroupsBody } from './GroupsBody';

const GROUPS_TITLE = 'Gruppen';

const SEARCH_PLACEHOLDER = 'Name der Gruppe';

export const GroupsPage: FC = () => {
  const search = useScreenSearch(SEARCH_PLACEHOLDER);
  const groups = useGroupsQuery();
  const lead = groups.data === undefined ? undefined : toGroupsLead(groups.data.groups);

  return (
    <KkScreen
      kind="list"
      search={search}
      title={GROUPS_TITLE}
      origin={CLUB_ORIGIN}
      header={<KkTitleHeader title={GROUPS_TITLE} lead={lead} />}
    >
      <GroupsBody />
    </KkScreen>
  );
};

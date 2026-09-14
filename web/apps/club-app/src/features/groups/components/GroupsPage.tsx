import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { useGroupsQuery } from '../api';
import { toGroupsLead } from '../groups-labels';
import { GroupsBody } from './GroupsBody';

const GROUPS_TITLE = 'Gruppen';

export const GroupsPage: FC = () => {
  const groups = useGroupsQuery();
  const lead = groups.data === undefined ? undefined : toGroupsLead(groups.data.groups);

  return (
    <>
      <AppPageHeader>
        <KkAppShell.PageTitle>{GROUPS_TITLE}</KkAppShell.PageTitle>
        <KkAppShell.PageLead>{lead}</KkAppShell.PageLead>
      </AppPageHeader>
      <GroupsBody />
    </>
  );
};

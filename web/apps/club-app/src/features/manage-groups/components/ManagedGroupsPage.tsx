import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MORE_ORIGIN, RequirePermission, useScreenSearch } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedGroupsQuery } from '../api';
import { toManagedGroupsIntro } from '../manage-groups-labels';
import { ManagedGroupsBody } from './ManagedGroupsBody';

const MANAGE_GROUPS_TITLE = 'Gruppenverwaltung';

const SEARCH_PLACEHOLDER = 'Name der Gruppe';

export const ManagedGroupsPage: FC = () => {
  const search = useScreenSearch(SEARCH_PLACEHOLDER);
  const groups = useManagedGroupsQuery();
  const lead = groups.data === undefined ? undefined : toManagedGroupsIntro(groups.data.groups);

  return (
    <KkScreen
      kind="list"
      search={search}
      title={MANAGE_GROUPS_TITLE}
      origin={MORE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_GROUPS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.groupsManage}>
        <ManagedGroupsBody />
      </RequirePermission>
    </KkScreen>
  );
};

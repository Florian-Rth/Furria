import type { FC } from 'react';
import { useGroupHubQuery } from '@/features/group-hub/api';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { parsePositiveId } from '@/lib/positive-id';
import { isNotFoundError } from '@/lib/query-error';
import { GROUP_ACTS_TITLE } from '../acts-copy';
import { groupOriginOf } from '../acts-origin';
import type { ActsSearch } from '../schemas';
import { ActsScreen } from './ActsScreen';

const DENIED_MESSAGE =
  'Die Auftritte einer Gruppe pflegen ihre Gruppenleitung und die Ablaufplanung.';

interface GroupActsPageProps {
  groupId: string;
  search: ActsSearch;
}

export const GroupActsPage: FC<GroupActsPageProps> = ({ groupId, search }) => {
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);
  const permissions = usePermissions();
  const plans = usePlansRunningOrder();

  if (id === null || isNotFoundError(hub.error)) {
    return <ScreenNotFound />;
  }

  const origin = groupOriginOf(id, hub.data?.name ?? GROUP_ACTS_TITLE);
  const decided = hub.data !== undefined && !permissions.isUndecided;
  const allowed = plans || hub.data?.viewerIsAdmin === true;

  if (decided && !allowed) {
    return <AccessDeniedScreen title={GROUP_ACTS_TITLE} origin={origin} message={DENIED_MESSAGE} />;
  }

  return (
    <ActsScreen
      scope={{ kind: 'group', groupId: id }}
      search={search}
      title={GROUP_ACTS_TITLE}
      origin={origin}
    />
  );
};

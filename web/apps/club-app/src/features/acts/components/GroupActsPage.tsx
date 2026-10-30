import type { FC } from 'react';
import { useGroupHubQuery } from '@/features/group-hub/api';
import { usePlansRunningOrder } from '@/features/running-order/hooks/use-plans-running-order';
import { START_ORIGIN } from '@/features/session/app-sections';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { parsePositiveId } from '@/lib/positive-id';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { GROUP_ACTS_TITLE } from '../acts-copy';
import { groupOriginOf } from '../acts-origin';
import type { ActsSearch } from '../schemas';
import { ActsScreen } from './ActsScreen';
import { GroupActsFailure } from './GroupActsFailure';

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
  if (isForbiddenError(hub.error)) {
    return (
      <AccessDeniedScreen title={GROUP_ACTS_TITLE} origin={START_ORIGIN} message={DENIED_MESSAGE} />
    );
  }

  const origin = groupOriginOf(id, hub.data?.name ?? GROUP_ACTS_TITLE);
  const decided = hub.data !== undefined && !permissions.isUndecided;
  const allowed = plans || hub.data?.viewerIsAdmin === true;

  const retryHub = (): void => {
    void hub.refetch();
  };

  if (decided && !allowed) {
    return <AccessDeniedScreen title={GROUP_ACTS_TITLE} origin={origin} message={DENIED_MESSAGE} />;
  }
  if (hub.data === undefined && hub.error !== null && !plans) {
    return (
      <GroupActsFailure
        origin={origin}
        error={hub.error}
        retrying={hub.isFetching}
        onRetry={retryHub}
      />
    );
  }

  return (
    <ActsScreen
      scope={{ kind: 'group', groupId: id }}
      search={search}
      title={GROUP_ACTS_TITLE}
      origin={origin}
      mayRead={allowed}
    />
  );
};

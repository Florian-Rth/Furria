import type { FC } from 'react';
import {
  PLANNER_PERMISSION_KEYS,
  usePlansRunningOrder,
} from '@/features/running-order/hooks/use-plans-running-order';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { ACTS_TITLE } from '../acts-copy';
import { actsCatalogueOriginOf, actsCatalogueReturnOf, CLUB_SCOPE } from '../acts-origin';
import type { ActsSearch } from '../schemas';
import { ActsScreen } from './ActsScreen';

interface ActsPageProps {
  search: ActsSearch;
}

export const ActsPage: FC<ActsPageProps> = ({ search }) => {
  const plans = usePlansRunningOrder();
  const permissions = usePermissions();
  const origin = actsCatalogueOriginOf(
    actsCatalogueReturnOf(search.from, {
      plans,
      managesEvents: permissions.has(PERMISSION_KEYS.eventsManage),
    }),
  );

  return (
    <RequireAnyScreenPermission
      permissionKeys={PLANNER_PERMISSION_KEYS}
      title={ACTS_TITLE}
      origin={origin}
    >
      <ActsScreen
        scope={CLUB_SCOPE}
        search={search}
        title={ACTS_TITLE}
        origin={origin}
        mayRead={plans}
      />
    </RequireAnyScreenPermission>
  );
};

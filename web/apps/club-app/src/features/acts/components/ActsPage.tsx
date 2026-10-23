import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { EVENTS_ORIGIN } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { ACTS_TITLE } from '../acts-copy';
import { CLUB_SCOPE, plannerOriginOf } from '../acts-origin';
import type { ActsSearch } from '../schemas';
import { ActsScreen } from './ActsScreen';

const PLANNERS = [PERMISSION_KEYS.eventsRunningOrder, PERMISSION_KEYS.eventsManage] as const;

interface ActsPageProps {
  search: ActsSearch;
}

export const ActsPage: FC<ActsPageProps> = ({ search }) => {
  const origin: KkScreenOrigin =
    search.from === undefined ? EVENTS_ORIGIN : plannerOriginOf(search.from);

  return (
    <RequireAnyScreenPermission permissionKeys={PLANNERS} title={ACTS_TITLE} origin={origin}>
      <ActsScreen scope={CLUB_SCOPE} search={search} title={ACTS_TITLE} origin={origin} />
    </RequireAnyScreenPermission>
  );
};

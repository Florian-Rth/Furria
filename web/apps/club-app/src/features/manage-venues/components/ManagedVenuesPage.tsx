import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedVenuesQuery } from '../api';
import { MANAGE_VENUES_TITLE, toManagedVenuesIntro } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { ManagedVenuesBody } from './ManagedVenuesBody';

const NO_VENUES: readonly ManagedVenue[] = [];

export const ManagedVenuesPage: FC = () => {
  const venues = useManagedVenuesQuery();
  const rows = venues.data?.venues ?? NO_VENUES;
  const lead = venues.data === undefined ? undefined : toManagedVenuesIntro(rows);

  return (
    <KkScreen
      kind="list"
      title={MANAGE_VENUES_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_VENUES_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManagedVenuesBody />
      </RequirePermission>
    </KkScreen>
  );
};

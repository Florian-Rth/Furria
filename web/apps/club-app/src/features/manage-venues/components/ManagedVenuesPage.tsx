import type { KkLoudScreenAction } from '@furria/ui';
import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedVenuesQuery } from '../api';
import { useVenueCreateDialog } from '../hooks/use-venue-create-dialog';
import {
  MANAGE_VENUES_CREATE_LABEL,
  MANAGE_VENUES_TITLE,
  toManagedVenuesIntro,
} from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { ManagedVenuesBody } from './ManagedVenuesBody';
import { VenueFormDialog } from './VenueFormDialog';

const NO_VENUES: readonly ManagedVenue[] = [];

export const ManagedVenuesPage: FC = () => {
  const venues = useManagedVenuesQuery();
  const rows = venues.data?.venues ?? NO_VENUES;
  const create = useVenueCreateDialog();
  const { has } = usePermissions();
  const canManage = has(PERMISSION_KEYS.clubManage);
  const lead = venues.data === undefined ? undefined : toManagedVenuesIntro(rows);

  const createAction: KkLoudScreenAction = {
    id: 'create-venue',
    label: MANAGE_VENUES_CREATE_LABEL,
    icon: 'add',
    emphasis: true,
    onSelect: create.open,
  };

  const actions: readonly [KkLoudScreenAction] | undefined = canManage ? [createAction] : undefined;

  return (
    <KkScreen
      kind="list"
      actions={actions}
      title={MANAGE_VENUES_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_VENUES_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.clubManage}>
        <ManagedVenuesBody onCreate={create.open} />
        <VenueFormDialog
          venue={null}
          open={create.isOpen}
          onClose={create.close}
          onSaved={create.close}
        />
      </RequirePermission>
    </KkScreen>
  );
};

import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedKeysQuery } from '../api';
import { MANAGE_KEYS_TITLE, toManagedKeysIntro } from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';
import { ManagedKeysBody } from './ManagedKeysBody';

const NO_VENUES: readonly KeyVenue[] = [];

export const ManagedKeysPage: FC = () => {
  const keys = useManagedKeysQuery();
  const venues = keys.data?.venues ?? NO_VENUES;
  const lead = keys.data === undefined ? undefined : toManagedKeysIntro(venues);

  return (
    <KkScreen
      kind="list"
      title={MANAGE_KEYS_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={MANAGE_KEYS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.keyHoldingsManage}>
        <ManagedKeysBody />
      </RequirePermission>
    </KkScreen>
  );
};

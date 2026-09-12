import { KkButton, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import type { HubAdmin } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';

interface HubAdminRowProps {
  admin: HubAdmin;
  canManage: boolean;
  onEnd: (groupAdminId: number) => void;
}

export const HubAdminRow: FC<HubAdminRowProps> = ({ admin, canManage, onEnd }) => {
  const name = `${admin.firstName} ${admin.lastName}`;
  const meta = admin.function ?? undefined;

  const end = (): void => {
    onEnd(admin.groupAdminId);
  };

  const trailing = canManage ? (
    <KkButton size="small" variant="outlined" tone="danger" onClick={end}>
      {END_LABEL}
    </KkButton>
  ) : null;

  return (
    <KkSinceRow
      icon="role"
      tone="accent"
      title={name}
      meta={meta}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(admin.since)}
      trailing={trailing}
    />
  );
};

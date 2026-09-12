import { KkButton, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import type { ManagedAdmin } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';

interface OverrideAdminRowProps {
  admin: ManagedAdmin;
  canManage: boolean;
  onEnd: (groupAdminId: number) => void;
}

export const OverrideAdminRow: FC<OverrideAdminRowProps> = ({ admin, canManage, onEnd }) => {
  const name = `${admin.firstName} ${admin.lastName}`;

  const end = (): void => {
    onEnd(admin.groupAdminId);
  };

  const trailing = canManage ? (
    <KkButton size="small" variant="text" tone="danger" onClick={end}>
      {END_LABEL}
    </KkButton>
  ) : null;

  return (
    <KkSinceRow
      icon="role"
      tone="accent"
      title={name}
      meta={admin.function ?? undefined}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(admin.since)}
      trailing={trailing}
    />
  );
};

import { KkAvatar, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import type { RoleOverviewHolder } from '@/features/roles-overview';
import { toInitials } from '@/lib/initials';
import { formatIsoDay } from '@/lib/membership-labels';

const SINCE_LABEL = 'Inhaber seit';

interface RoleHolderRowProps {
  holder: RoleOverviewHolder;
}

export const RoleHolderRow: FC<RoleHolderRowProps> = ({ holder }) => {
  const name = `${holder.firstName} ${holder.lastName}`;
  const initials = toInitials(holder.firstName, holder.lastName);
  const avatar = <KkAvatar initials={initials} size="small" />;

  return (
    <KkSinceRow
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatIsoDay(holder.sinceOn)}
    />
  );
};

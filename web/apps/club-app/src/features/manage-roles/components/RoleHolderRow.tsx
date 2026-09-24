import { KkAvatar, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toInitials } from '@/lib/initials';
import { toHolderSinceValue, toPersonName } from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';

const SINCE_LABEL = 'seit';
const HOLDING_ROUTE = '/manage/roles/$roleId/holdings/$roleHoldingId';

interface RoleHolderRowProps {
  roleId: number;
  holder: RoleHolder;
  highlightedKey: string | null;
}

export const RoleHolderRow: FC<RoleHolderRowProps> = ({ roleId, holder, highlightedKey }) => {
  const name = toPersonName(holder);
  const landing = toLandingKey('role-holding', holder.roleHoldingId);

  const avatar = (
    <KkAvatar
      initials={toInitials(holder.firstName, holder.lastName)}
      size="small"
      component="span"
    />
  );

  return (
    <KkSinceRow
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={toHolderSinceValue(holder)}
      component={Link}
      to={HOLDING_ROUTE}
      params={{ roleId: String(roleId), roleHoldingId: String(holder.roleHoldingId) }}
      highlight={highlightedKey === landing}
      landing={landing}
    />
  );
};

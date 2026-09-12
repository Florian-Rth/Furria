import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toEndHolderLabel, toHolderSinceValue, toPersonName } from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';
const MEMBER_PATH = '/members/$personId';

interface RoleHolderRowProps {
  holder: RoleHolder;
  viewerIsAffiliated: boolean;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHolderRow: FC<RoleHolderRowProps> = ({ holder, viewerIsAffiliated, onEnd }) => {
  const name = toPersonName(holder);

  const avatar = (
    <KkAvatar
      initials={toInitials(holder.firstName, holder.lastName)}
      size="small"
      component="span"
    />
  );

  const end = (): void => {
    onEnd(holder.roleHoldingId);
  };

  const trailing = (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={toEndHolderLabel(name)}
      onClick={end}
    >
      {END_LABEL}
    </KkButton>
  );

  const canOpen = viewerIsAffiliated && holder.isAffiliated;

  const titleLink = canOpen
    ? {
        titleComponent: Link,
        titleTo: MEMBER_PATH,
        titleParams: { personId: String(holder.personId) },
      }
    : {};

  return (
    <KkSinceRow
      {...titleLink}
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={toHolderSinceValue(holder)}
      trailing={trailing}
    />
  );
};

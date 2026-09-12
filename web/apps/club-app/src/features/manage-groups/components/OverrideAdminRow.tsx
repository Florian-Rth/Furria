import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import { toEndAdminLabel } from '../manage-groups-labels';
import type { ManagedAdmin } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';
const MEMBER_PATH = '/members/$personId';

interface OverrideAdminRowProps {
  admin: ManagedAdmin;
  canManage: boolean;
  canOpenPerson: boolean;
  onEnd: (groupAdminId: number) => void;
}

export const OverrideAdminRow: FC<OverrideAdminRowProps> = ({
  admin,
  canManage,
  canOpenPerson,
  onEnd,
}) => {
  const name = `${admin.firstName} ${admin.lastName}`;
  const avatar = (
    <KkAvatar
      initials={toInitials(admin.firstName, admin.lastName)}
      size="small"
      component="span"
    />
  );

  const end = (): void => {
    onEnd(admin.groupAdminId);
  };

  const trailing = canManage ? (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={toEndAdminLabel(name)}
      onClick={end}
    >
      {END_LABEL}
    </KkButton>
  ) : null;

  const titleLink = canOpenPerson
    ? {
        titleComponent: Link,
        titleTo: MEMBER_PATH,
        titleParams: { personId: String(admin.personId) },
      }
    : {};

  return (
    <KkSinceRow
      {...titleLink}
      avatar={avatar}
      title={name}
      meta={admin.function ?? undefined}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(admin.since)}
      trailing={trailing}
    />
  );
};

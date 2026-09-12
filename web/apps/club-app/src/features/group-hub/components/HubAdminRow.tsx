import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import type { HubAdmin } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';
const MEMBER_PATH = '/members/$personId';

interface HubAdminRowProps {
  admin: HubAdmin;
  canManage: boolean;
  canOpenPerson: boolean;
  onEnd: (groupAdminId: number) => void;
}

export const HubAdminRow: FC<HubAdminRowProps> = ({ admin, canManage, canOpenPerson, onEnd }) => {
  const name = `${admin.firstName} ${admin.lastName}`;
  const initials = toInitials(admin.firstName, admin.lastName);
  const meta = admin.function ?? undefined;

  const end = (): void => {
    onEnd(admin.groupAdminId);
  };

  const trailing = canManage ? (
    <KkButton size="small" variant="text" tone="danger" onClick={end}>
      {END_LABEL}
    </KkButton>
  ) : null;

  const opensPerson = canOpenPerson && !canManage;
  const linkProps = opensPerson
    ? { component: Link, to: MEMBER_PATH, params: { personId: String(admin.personId) } }
    : {};

  const avatar = <KkAvatar initials={initials} size="small" component="span" />;

  return (
    <KkSinceRow
      {...linkProps}
      avatar={avatar}
      title={name}
      meta={meta}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(admin.since)}
      trailing={trailing}
    />
  );
};

import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import { toEndMembershipLabel } from '../manage-groups-labels';
import type { ManagedMember } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';
const MEMBER_PATH = '/members/$personId';

interface OverrideMemberRowProps {
  member: ManagedMember;
  canManage: boolean;
  canOpenPerson: boolean;
  onEnd: (groupMembershipId: number) => void;
}

export const OverrideMemberRow: FC<OverrideMemberRowProps> = ({
  member,
  canManage,
  canOpenPerson,
  onEnd,
}) => {
  const name = `${member.firstName} ${member.lastName}`;
  const avatar = (
    <KkAvatar
      initials={toInitials(member.firstName, member.lastName)}
      size="small"
      component="span"
    />
  );

  const end = (): void => {
    onEnd(member.groupMembershipId);
  };

  const trailing = canManage ? (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={toEndMembershipLabel(name)}
      onClick={end}
    >
      {END_LABEL}
    </KkButton>
  ) : null;

  const titleLink = canOpenPerson
    ? {
        titleComponent: Link,
        titleTo: MEMBER_PATH,
        titleParams: { personId: String(member.personId) },
      }
    : {};

  return (
    <KkSinceRow
      {...titleLink}
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(member.since)}
      trailing={trailing}
    />
  );
};

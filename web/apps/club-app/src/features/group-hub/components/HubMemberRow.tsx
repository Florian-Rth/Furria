import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import { END_LABEL, toEndMembershipActionLabel } from '../group-hub-labels';
import type { HubMember } from '../schemas';

const SINCE_LABEL = 'seit';
const MEMBER_PATH = '/members/$personId';

interface HubMemberRowProps {
  member: HubMember;
  canManage: boolean;
  canOpenPerson: boolean;
  onEnd: (groupMembershipId: number) => void;
}

export const HubMemberRow: FC<HubMemberRowProps> = ({
  member,
  canManage,
  canOpenPerson,
  onEnd,
}) => {
  const name = `${member.firstName} ${member.lastName}`;
  const initials = toInitials(member.firstName, member.lastName);

  const end = (): void => {
    onEnd(member.groupMembershipId);
  };

  const trailing = canManage ? (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={toEndMembershipActionLabel(name)}
      onClick={end}
    >
      {END_LABEL}
    </KkButton>
  ) : null;

  const titleLinkProps = canOpenPerson
    ? {
        titleComponent: Link,
        titleTo: MEMBER_PATH,
        titleParams: { personId: String(member.personId) },
      }
    : {};

  const avatar = <KkAvatar initials={initials} size="small" component="span" />;

  return (
    <KkSinceRow
      {...titleLinkProps}
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(member.since)}
      trailing={trailing}
    />
  );
};

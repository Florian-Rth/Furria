import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import { END_LABEL, SINCE_LABEL, toEndMembershipActionLabel } from '../group-detail-labels';
import type { GroupDetailPerson } from '../schemas';
import { scrollNewRowIntoView } from '../scroll-new-row';

const MEMBER_PATH = '/members/$personId';

interface GroupMemberRowProps {
  member: GroupDetailPerson;
  canManage: boolean;
  canOpenPerson: boolean;
  onEnd?: () => void;
  isNew?: boolean;
  overlay?: ReactNode;
}

export const GroupMemberRow: FC<GroupMemberRowProps> = ({
  member,
  canManage,
  canOpenPerson,
  onEnd,
  isNew = false,
  overlay,
}) => {
  const name = `${member.firstName} ${member.lastName}`;
  const avatar = (
    <KkAvatar
      initials={toInitials(member.firstName, member.lastName)}
      size="small"
      component="span"
    />
  );

  const trailing =
    canManage && onEnd !== undefined ? (
      <KkButton
        size="small"
        variant="text"
        tone="danger"
        ariaLabel={toEndMembershipActionLabel(name)}
        onClick={onEnd}
      >
        {END_LABEL}
      </KkButton>
    ) : null;

  const personRoute = { to: MEMBER_PATH, params: { personId: String(member.personId) } };
  const rowLink = canOpenPerson && trailing === null ? { component: Link, ...personRoute } : {};
  const titleLink =
    canOpenPerson && trailing !== null
      ? { titleComponent: Link, titleTo: personRoute.to, titleParams: personRoute.params }
      : {};

  return (
    <KkSinceRow
      {...rowLink}
      {...titleLink}
      ref={isNew ? scrollNewRowIntoView : undefined}
      avatar={avatar}
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(member.since)}
      trailing={trailing}
      highlight={isNew}
      overlay={overlay}
    />
  );
};

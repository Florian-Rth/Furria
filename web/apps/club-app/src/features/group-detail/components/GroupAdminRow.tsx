import { KkAvatar, KkButton, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { toInitials } from '@/lib/initials';
import { formatSinceSession } from '@/lib/membership-labels';
import { END_LABEL, SINCE_LABEL, toEndAdminActionLabel } from '../group-detail-labels';
import type { GroupDetailFunctionary } from '../schemas';
import { scrollNewRowIntoView } from '../scroll-new-row';

const MEMBER_PATH = '/members/$personId';

interface GroupAdminRowProps {
  admin: GroupDetailFunctionary;
  canManage: boolean;
  viewerIsAffiliated: boolean;
  onEnd?: () => void;
  isNew?: boolean;
  overlay?: ReactNode;
}

export const GroupAdminRow: FC<GroupAdminRowProps> = ({
  admin,
  canManage,
  viewerIsAffiliated,
  onEnd,
  isNew = false,
  overlay,
}) => {
  const name = `${admin.firstName} ${admin.lastName}`;
  const avatar = (
    <KkAvatar
      initials={toInitials(admin.firstName, admin.lastName)}
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
        ariaLabel={toEndAdminActionLabel(name)}
        onClick={onEnd}
      >
        {END_LABEL}
      </KkButton>
    ) : null;

  const canOpen = viewerIsAffiliated && admin.isAffiliated;
  const personRoute = { to: MEMBER_PATH, params: { personId: String(admin.personId) } };
  const rowLink = canOpen && trailing === null ? { component: Link, ...personRoute } : {};
  const titleLink =
    canOpen && trailing !== null
      ? { titleComponent: Link, titleTo: personRoute.to, titleParams: personRoute.params }
      : {};

  return (
    <KkSinceRow
      {...rowLink}
      {...titleLink}
      ref={isNew ? scrollNewRowIntoView : undefined}
      avatar={avatar}
      title={name}
      meta={admin.function ?? undefined}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(admin.since)}
      trailing={trailing}
      highlight={isNew}
      overlay={overlay}
    />
  );
};

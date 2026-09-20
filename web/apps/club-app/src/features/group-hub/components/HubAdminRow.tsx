import { KkButton, KkPersonRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupDetailAdmin } from '@/features/group-detail';
import { END_LABEL, toEndAdminActionLabel } from '@/features/group-detail';
import { toInitials } from '@/lib/initials';
import { toMemberSinceLine } from '../group-hub-labels';

const MEMBER_PATH = '/members/$personId';
const NO_FUNCTION_LABEL = 'ohne Funktion';

interface HubAdminRowProps {
  admin: GroupDetailAdmin;
  canManage: boolean;
  viewerIsAffiliated: boolean;
  onEnd: () => void;
}

export const HubAdminRow: FC<HubAdminRowProps> = ({
  admin,
  canManage,
  viewerIsAffiliated,
  onEnd,
}) => {
  const name = `${admin.firstName} ${admin.lastName}`;

  const trailing = canManage ? (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={toEndAdminActionLabel(name)}
      onClick={onEnd}
    >
      {END_LABEL}
    </KkButton>
  ) : undefined;

  const canOpen = !canManage && viewerIsAffiliated && admin.isAffiliated;
  const rowLink = canOpen
    ? { component: Link, to: MEMBER_PATH, params: { personId: String(admin.personId) } }
    : {};

  return (
    <KkPersonRow
      {...rowLink}
      initials={toInitials(admin.firstName, admin.lastName)}
      name={name}
      accent={admin.function ?? undefined}
      emptyMeta={NO_FUNCTION_LABEL}
      meta={toMemberSinceLine(admin.since)}
      trailing={trailing}
    />
  );
};

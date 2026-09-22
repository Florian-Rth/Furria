import { KkAvatarStack, KkButton, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import {
  APPOINT_ADMIN_LABEL,
  toAppointAdminActionLabel,
  toGroupAdminsLine,
} from '../manage-groups-labels';

const AVATAR_MAX = 2;

const ROW = { alignItems: 'center', gap: 0.875, minWidth: 0 } as const;
const AVATARS = { flexShrink: 0 } as const;

const CLAMPED_LINE = {
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

interface GroupRegisterAdminsProps {
  admins: readonly PersonRef[];
  groupName: string;
  canAppoint: boolean;
  onAppoint: () => void;
}

export const GroupRegisterAdmins: FC<GroupRegisterAdminsProps> = ({
  admins,
  groupName,
  canAppoint,
  onAppoint,
}) => {
  const line = toGroupAdminsLine(admins);

  if (line === null) {
    if (!canAppoint) {
      return null;
    }

    return (
      <KkButton
        size="small"
        variant="outlined"
        tone="danger"
        ariaLabel={toAppointAdminActionLabel(groupName)}
        onClick={onAppoint}
      >
        {APPOINT_ADMIN_LABEL}
      </KkButton>
    );
  }

  const initials = admins.map((person) => toInitials(person.firstName, person.lastName));

  return (
    <Stack direction="row" sx={ROW}>
      <KkAvatarStack initials={initials} max={AVATAR_MAX} total={admins.length} sx={AVATARS} />
      <KkMeta sx={CLAMPED_LINE}>{line}</KkMeta>
    </Stack>
  );
};

import { KkAvatarStack, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';

const AVATAR_MAX = 2;

const ROW = { alignItems: 'center', gap: 0.875, minWidth: 0 } as const;
const AVATARS = { flexShrink: 0 } as const;

const CLAMPED_LINE = {
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

interface GroupRegisterFactsProps {
  admins: readonly PersonRef[];
  line: string | null;
}

export const GroupRegisterFacts: FC<GroupRegisterFactsProps> = ({ admins, line }) => {
  if (line === null) {
    return null;
  }

  const initials = admins.map((person) => toInitials(person.firstName, person.lastName));
  const avatars =
    initials.length === 0 ? null : (
      <KkAvatarStack initials={initials} max={AVATAR_MAX} total={admins.length} sx={AVATARS} />
    );

  return (
    <Stack direction="row" sx={ROW}>
      {avatars}
      <KkMeta sx={CLAMPED_LINE}>{line}</KkMeta>
    </Stack>
  );
};

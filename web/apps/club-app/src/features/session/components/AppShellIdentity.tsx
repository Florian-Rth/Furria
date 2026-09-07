import { KkAppShell, KkAvatar, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Me } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';

interface AppShellIdentityProps {
  me: Me;
}

export const AppShellIdentity: FC<AppShellIdentityProps> = ({ me }) => {
  const { firstName, lastName } = me.person;
  const fullName = `${firstName} ${lastName}`;
  const initials = toInitials(firstName, lastName);

  return (
    <KkAppShell.UserBlock>
      <KkAvatar initials={initials} />
      <Stack sx={{ minWidth: 0 }}>
        <KkText variant="subtitle2">{fullName}</KkText>
        <KkText variant="caption" tone="secondary">
          {me.email}
        </KkText>
      </Stack>
    </KkAppShell.UserBlock>
  );
};

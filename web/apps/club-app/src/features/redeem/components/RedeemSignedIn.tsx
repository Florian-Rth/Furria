import { KkButton, KkHeading, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppSignOutButton } from '@/features/session';
import { DEFAULT_RETURN_TO } from '@/lib/return-to';

const SIGNED_IN_TITLE = 'DU BIST ANGEMELDET';
const SIGNED_IN_LINE =
  'Auf diesem Gerät ist gerade jemand angemeldet. Melde dich ab, um die Einladung anzunehmen.';
const APP_LABEL = 'Zur App';

export const RedeemSignedIn: FC = () => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <Stack sx={{ gap: 1 }}>
      <KkHeading level={1} component="h1">
        {SIGNED_IN_TITLE}
      </KkHeading>
      <KkNote>{SIGNED_IN_LINE}</KkNote>
    </Stack>
    <Stack sx={{ gap: 1.25 }}>
      <AppSignOutButton />
      <KkButton variant="text" fullWidth component={Link} to={DEFAULT_RETURN_TO}>
        {APP_LABEL}
      </KkButton>
    </Stack>
  </Stack>
);

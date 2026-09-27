import { KkButton, KkHeading, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { REQUEST_ACCESS_PATH } from '@/features/login';
import { LOGIN_PATH } from '@/lib/return-to';

const DEAD_TITLE = 'DIESE EINLADUNG GILT NICHT MEHR';
const DEAD_LINE =
  'Der Link ist abgelaufen, wurde durch einen neueren ersetzt oder schon benutzt. Mit der E-Mail-Adresse, die der Verein von dir hat, forderst du dir selbst eine neue an – sonst wende dich an den Verein.';
const REQUEST_LABEL = 'Neue Einladung anfordern';
const LOGIN_LABEL = 'Zur Anmeldung';

export const RedeemDead: FC = () => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <Stack sx={{ gap: 1 }}>
      <KkHeading level={1} component="h1">
        {DEAD_TITLE}
      </KkHeading>
      <KkNote>{DEAD_LINE}</KkNote>
    </Stack>
    <Stack sx={{ gap: 1.25 }}>
      <KkButton fullWidth component={Link} to={REQUEST_ACCESS_PATH}>
        {REQUEST_LABEL}
      </KkButton>
      <KkButton variant="outlined" fullWidth component={Link} to={LOGIN_PATH}>
        {LOGIN_LABEL}
      </KkButton>
    </Stack>
  </Stack>
);

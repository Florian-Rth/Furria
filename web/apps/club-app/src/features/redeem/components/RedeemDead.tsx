import { KkButton, KkHeading, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LOGIN_PATH } from '@/lib/return-to';

const DEAD_TITLE = 'DIESE EINLADUNG GILT NICHT MEHR';
const DEAD_LINE =
  'Der Link ist abgelaufen, wurde durch einen neueren ersetzt oder schon benutzt. Wende dich an den Verein, damit er dir eine neue Einladung schickt.';
const LOGIN_LABEL = 'Zur Anmeldung';

export const RedeemDead: FC = () => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <Stack sx={{ gap: 1 }}>
      <KkHeading level={1} component="h1">
        {DEAD_TITLE}
      </KkHeading>
      <KkNote>{DEAD_LINE}</KkNote>
    </Stack>
    <KkButton variant="outlined" fullWidth component={Link} to={LOGIN_PATH}>
      {LOGIN_LABEL}
    </KkButton>
  </Stack>
);

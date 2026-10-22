import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { FORGOT_PASSWORD_PATH } from '@/features/login/signed-out-paths';
import { LOGIN_PATH } from '@/lib/return-to';

const DEAD_TITLE = 'DIESER LINK GILT NICHT MEHR';
const DEAD_LINE =
  'Der Link ist abgelaufen, schon benutzt oder unvollständig. Fordere einfach einen neuen an.';
const REQUEST_LABEL = 'Neuen Link anfordern';
const LOGIN_LABEL = 'Zur Anmeldung';

export const ResetLinkDead: FC = () => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <Stack sx={{ gap: 1 }}>
      <KkHeading level={1} component="h1">
        {DEAD_TITLE}
      </KkHeading>
      <KkNote>{DEAD_LINE}</KkNote>
    </Stack>
    <Stack sx={{ gap: 1.25 }}>
      <KkButton fullWidth component={Link} to={FORGOT_PASSWORD_PATH}>
        {REQUEST_LABEL}
      </KkButton>
      <KkButton variant="text" fullWidth component={Link} to={LOGIN_PATH}>
        {LOGIN_LABEL}
      </KkButton>
    </Stack>
  </Stack>
);

import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { REQUEST_ACCESS_PATH } from '@/features/login/signed-out-paths';
import { LOGIN_PATH } from '@/lib/return-to';

const DEAD_TITLE = 'DIESE EINLADUNG GILT NICHT MEHR';
const REQUEST_LABEL = 'Neue Einladung anfordern';
const LOGIN_LABEL = 'Zur Anmeldung';

export const RedeemDead: FC = () => (
  <Stack sx={{ gap: 2.5, minWidth: 0 }}>
    <KkHeading level={1} component="h1">
      {DEAD_TITLE}
    </KkHeading>
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

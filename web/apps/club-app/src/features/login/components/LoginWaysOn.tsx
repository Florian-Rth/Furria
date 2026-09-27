import { KkButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { FORGOT_PASSWORD_PATH, REQUEST_ACCESS_PATH } from '../signed-out-paths';

const CODE_ENTRY_PATH = '/invitation/code';
const CODE_ENTRY_LABEL = 'Code eingeben';
const REQUEST_ACCESS_LABEL = 'Zugang anfordern';
const FORGOT_PASSWORD_LABEL = 'Passwort vergessen';

export const LoginWaysOn: FC = () => (
  <Stack sx={{ gap: 1.25, minWidth: 0 }}>
    <KkButton variant="outlined" fullWidth component={Link} to={REQUEST_ACCESS_PATH}>
      {REQUEST_ACCESS_LABEL}
    </KkButton>
    <KkButton variant="outlined" fullWidth component={Link} to={CODE_ENTRY_PATH}>
      {CODE_ENTRY_LABEL}
    </KkButton>
    <KkButton variant="text" fullWidth component={Link} to={FORGOT_PASSWORD_PATH}>
      {FORGOT_PASSWORD_LABEL}
    </KkButton>
  </Stack>
);

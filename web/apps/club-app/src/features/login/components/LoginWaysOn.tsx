import { KkButton } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

const CODE_ENTRY_PATH = '/invitation/code';
const CODE_ENTRY_LABEL = 'Code eingeben';

export const LoginWaysOn: FC = () => (
  <Stack sx={{ gap: 1.25, minWidth: 0 }}>
    <KkButton variant="outlined" fullWidth component={Link} to={CODE_ENTRY_PATH}>
      {CODE_ENTRY_LABEL}
    </KkButton>
  </Stack>
);

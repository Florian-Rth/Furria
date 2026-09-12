import { KkAppShell } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

interface AppBackLinkProps {
  label: string;
  to: string;
}

export const AppBackLink: FC<AppBackLinkProps> = ({ label, to }) => (
  <Stack sx={{ display: { xs: 'flex', desktop: 'none' }, minWidth: 0 }}>
    <KkAppShell.BackLink label={label} component={Link} to={to} />
  </Stack>
);

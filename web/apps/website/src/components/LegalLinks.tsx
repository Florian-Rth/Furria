import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

// The always-public legal destinations — must stay reachable from every
// screen, including the ungated teaser (legally required).
export const LegalLinks: FC = () => (
  <Stack direction="row" sx={{ gap: 3 }}>
    <Link component={RouterLink} to="/imprint" color="inherit" variant="body2">
      Impressum
    </Link>
    <Link component={RouterLink} to="/privacy" color="inherit" variant="body2">
      Datenschutz
    </Link>
  </Stack>
);

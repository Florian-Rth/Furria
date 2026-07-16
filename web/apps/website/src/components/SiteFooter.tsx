import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

export const SiteFooter: FC = () => (
  <Stack
    component="footer"
    direction={{ xs: 'column', sm: 'row' }}
    sx={{
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      px: 3,
      py: 2.5,
      borderTop: 1,
      borderColor: 'divider',
      position: 'relative',
      zIndex: 1,
    }}
  >
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      © 2026 FURRIA · Gross - Furria!
    </Typography>
    <Stack direction="row" sx={{ gap: 3 }}>
      <Link component={RouterLink} to="/impressum" color="inherit" variant="body2">
        Impressum
      </Link>
      <Link component={RouterLink} to="/datenschutz" color="inherit" variant="body2">
        Datenschutz
      </Link>
    </Stack>
  </Stack>
);

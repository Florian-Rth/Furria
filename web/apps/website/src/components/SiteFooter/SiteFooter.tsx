import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { BroomMarkIcon } from './internal/BroomMarkIcon';
import { SocialLinks } from './internal/SocialLinks';

// Site chrome footer: brand/broom lockup, socials, legal links — a lean take
// on the mock's KKFooter.
export const SiteFooter: FC = () => (
  <Stack
    component="footer"
    sx={{
      gap: 3,
      px: { xs: 2.5, md: 7 },
      py: 4,
      borderTop: 1,
      borderColor: 'divider',
    }}
  >
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 3 }}>
      <Stack sx={{ gap: 1.5, maxWidth: 'sm' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
          <BroomMarkIcon />
          <Typography variant="h5" component="span" sx={{ letterSpacing: '0.06em' }}>
            FURRIA
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Furrscher Carnevals Club e.V. · Die Großbesenstadt feiert seit 1971. Gross - Furria!
        </Typography>
      </Stack>
      <SocialLinks />
    </Stack>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
        pt: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        © 2026 Furrscher Carnevals Club e.V.
      </Typography>
      <Stack direction="row" sx={{ gap: 3 }}>
        <Link component={RouterLink} to="/imprint" color="inherit" variant="body2">
          Impressum
        </Link>
        <Link component={RouterLink} to="/privacy" color="inherit" variant="body2">
          Datenschutz
        </Link>
      </Stack>
    </Stack>
  </Stack>
);

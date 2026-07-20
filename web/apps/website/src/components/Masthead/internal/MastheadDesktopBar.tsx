import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { navItems } from '../nav-items';
import { MastheadNavLink } from './MastheadNavLink';
import { ThemeModeToggle } from './ThemeModeToggle';

const metaLabelSx = { fontWeight: 800, letterSpacing: '0.18em', whiteSpace: 'nowrap' } as const;

export const MastheadDesktopBar: FC = () => (
  <Stack sx={{ display: { xs: 'none', md: 'flex' } }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 2,
        px: 7,
        py: 0.75,
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.secondary',
      }}
    >
      <Typography variant="caption" sx={metaLabelSx}>
        GROSSBESENSTADT · EST. 1971
      </Typography>
      <Typography variant="caption" sx={{ ...metaLabelSx, color: 'primary.main' }}>
        ★ DIE FÜNFTE JAHRESZEIT ★
      </Typography>
      <Typography variant="caption" sx={{ ...metaLabelSx, justifySelf: 'end' }}>
        GROSS - FURRIA!
      </Typography>
    </Box>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 2.5,
        px: 7,
        py: 1.5,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2.5 }}>
        <Stack component="nav" aria-label="Hauptnavigation" direction="row" sx={{ gap: 2.5 }}>
          {navItems.map((item) => (
            <MastheadNavLink key={item.to} item={item} />
          ))}
        </Stack>
        <Box sx={{ flex: 1, borderBottom: 2, borderColor: 'text.primary' }} />
        <Typography variant="caption" sx={{ ...metaLabelSx, color: 'text.secondary' }}>
          Nº 128
        </Typography>
      </Stack>
      <Link component={RouterLink} to="/" underline="none">
        <Typography
          variant="h3"
          component="span"
          sx={{ color: 'text.primary', letterSpacing: '0.06em', lineHeight: 1 }}
        >
          FURRIA
        </Typography>
      </Link>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2.5 }}>
        <Typography variant="caption" sx={{ ...metaLabelSx, color: 'text.secondary' }}>
          SESSION 2026
        </Typography>
        <Box sx={{ flex: 1, borderBottom: 2, borderColor: 'text.primary' }} />
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <ThemeModeToggle />
          <Button component={RouterLink} to="/tickets" variant="contained" color="primary">
            Tickets
          </Button>
        </Stack>
      </Stack>
    </Box>
  </Stack>
);

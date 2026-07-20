import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { CloseIcon } from './CloseIcon';
import { MASTHEAD_CHIP_NAV_ID } from './MastheadChipNav';
import { MenuIcon } from './MenuIcon';
import { ThemeModeToggle } from './ThemeModeToggle';

interface MastheadMobileBarProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
}

export const MastheadMobileBar: FC<MastheadMobileBarProps> = ({ menuOpen, onMenuToggle }) => (
  <Box
    sx={{
      display: { xs: 'grid', md: 'none' },
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      px: 2,
      py: 1,
    }}
  >
    <IconButton
      aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
      aria-expanded={menuOpen}
      aria-controls={menuOpen ? MASTHEAD_CHIP_NAV_ID : undefined}
      edge="start"
      onClick={onMenuToggle}
      sx={{ justifySelf: 'start', color: 'text.primary' }}
    >
      {menuOpen ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
    <Link component={RouterLink} to="/" underline="none">
      <Stack sx={{ alignItems: 'center' }}>
        <Typography
          variant="h4"
          component="span"
          sx={{ color: 'text.primary', letterSpacing: '0.06em', lineHeight: 1 }}
        >
          FURRIA
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.18em' }}
        >
          Nº 128 · SESSION 2026
        </Typography>
      </Stack>
    </Link>
    <Box sx={{ justifySelf: 'end' }}>
      <ThemeModeToggle />
    </Box>
  </Box>
);

import { kkTokens } from '@furria/ui';
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
  <Stack
    direction="row"
    sx={{
      display: { xs: 'flex', md: 'none' },
      alignItems: 'center',
      gap: 1.5,
      px: kkTokens.layout.gutterX,
      py: 1,
    }}
  >
    <IconButton
      aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
      aria-expanded={menuOpen}
      aria-controls={menuOpen ? MASTHEAD_CHIP_NAV_ID : undefined}
      onClick={onMenuToggle}
      sx={{ color: 'text.primary' }}
    >
      {menuOpen ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
    <Box sx={{ flex: 1, mx: 1.5, borderBottom: 2, borderColor: 'text.primary' }} />
    <Link component={RouterLink} to="/" underline="none">
      <Typography
        variant="h4"
        component="span"
        sx={{ color: 'text.primary', letterSpacing: '0.06em', lineHeight: 1 }}
      >
        FURRIA
      </Typography>
    </Link>
    <Box sx={{ flex: 1, mx: 1.5, borderBottom: 2, borderColor: 'text.primary' }} />
    <ThemeModeToggle />
  </Stack>
);

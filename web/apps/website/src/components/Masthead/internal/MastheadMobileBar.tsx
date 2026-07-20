import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { MenuIcon } from './MenuIcon';

interface MastheadMobileBarProps {
  onMenuOpen: () => void;
}

export const MastheadMobileBar: FC<MastheadMobileBarProps> = ({ onMenuOpen }) => (
  <Stack sx={{ display: { xs: 'flex', md: 'none' } }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        px: 2,
        py: 1,
      }}
    >
      <IconButton
        aria-label="Menü öffnen"
        edge="start"
        onClick={onMenuOpen}
        sx={{ justifySelf: 'start', color: 'text.primary' }}
      >
        <MenuIcon />
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
      <Button
        component={RouterLink}
        to="/tickets"
        variant="contained"
        color="primary"
        size="small"
        sx={{ justifySelf: 'end' }}
      >
        Tickets
      </Button>
    </Box>
  </Stack>
);

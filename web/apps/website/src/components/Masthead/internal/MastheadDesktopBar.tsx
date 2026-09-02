import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { currentSession, FOUNDING_YEAR } from '@/lib/club';
import { eventsNavLabel, navItems } from '../nav-items';
import { MastheadNavLink } from './MastheadNavLink';
import { ThemeModeToggle } from './ThemeModeToggle';

const metaLabelSx = { fontWeight: 800, letterSpacing: '0.18em', whiteSpace: 'nowrap' } as const;

const metaHideSx = { display: { desktop: 'none', lg: 'block' } } as const;

const metaRuleSx = { flex: 1, display: { desktop: 'none', lg: 'block' } } as const;

export const MastheadDesktopBar: FC = () => (
  <Stack sx={{ display: { xs: 'none', desktop: 'flex' } }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 2,
        px: kkTokens.layout.gutterX,
        py: 0.75,
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.secondary',
      }}
    >
      <Typography variant="caption" sx={metaLabelSx}>
        GROSSFURRA · EST. {FOUNDING_YEAR}
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
        px: kkTokens.layout.gutterX,
        py: 1.5,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2.5, minWidth: 0 }}>
        <Stack component="nav" aria-label="Hauptnavigation" direction="row" sx={{ gap: 2.5 }}>
          {navItems.map((item) => (
            <MastheadNavLink key={item.to} item={item} />
          ))}
        </Stack>
        <Box sx={{ ...metaRuleSx, borderBottom: 2, borderColor: 'text.primary' }} />
        <Typography
          variant="caption"
          sx={{ ...metaLabelSx, ...metaHideSx, color: 'text.secondary' }}
        >
          NUMBER {currentSession.number}
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
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2.5, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ ...metaLabelSx, ...metaHideSx, color: 'text.secondary' }}
        >
          SESSION {currentSession.yearsLabel}
        </Typography>
        <Box sx={{ ...metaRuleSx, borderBottom: 2, borderColor: 'text.primary' }} />
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <ThemeModeToggle />
          <Button component={RouterLink} to="/events" variant="contained" color="primary">
            {eventsNavLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  </Stack>
);

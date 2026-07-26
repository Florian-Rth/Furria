import { KkBroomMark, KkConfettiRain, KkTwoToneHeadline, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

export const NotFoundPage: FC = () => (
  <Stack
    component="main"
    data-kk-not-found
    sx={{
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'center',
      px: kkTokens.layout.gutterX,
      py: kkTokens.layout.gutterY,
    }}
  >
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <KkConfettiRain />
    </Box>
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: '50%',
        right: { xs: -96, md: '4%' },
        transform: 'translateY(-50%) rotate(14deg)',
        color: 'text.primary',
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <KkBroomMark size={420} />
    </Box>
    <Container maxWidth="md" disableGutters sx={{ position: 'relative', zIndex: 1 }}>
      <Stack sx={{ gap: { xs: 3, md: 4 }, alignItems: 'flex-start' }}>
        <Typography
          variant="overline"
          sx={{ fontWeight: 900, letterSpacing: '0.24em', color: 'primary.main', lineHeight: 1.4 }}
        >
          FEHLER 404
        </Typography>
        <KkTwoToneHeadline line1="HIER WAR MAL" line2="EINE SEITE." />
        <Typography
          variant="subtitle1"
          sx={{ color: 'text.secondary', maxWidth: '34rem', textWrap: 'pretty' }}
        >
          Jetzt ist hier nur Konfetti. Passiert den Besten von uns.
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/" variant="contained" color="primary" size="large">
            Zur Startseite
          </Button>
          <Button component={RouterLink} to="/program" variant="outlined" size="large">
            Zum Programm →
          </Button>
        </Stack>
      </Stack>
    </Container>
  </Stack>
);

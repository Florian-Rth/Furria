import { KkTwoToneHeadline } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

export const LandingPage: FC = () => (
  <Stack
    component="main"
    sx={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 4,
      px: 3,
      py: 10,
    }}
  >
    <KkTwoToneHeadline line1="GROSS" line2="FURRIA!" posterShadow />
    <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm' }}>
      Der Furrsche Carnevals Club lädt die Großbesenstadt zur fünften Jahreszeit — gebunden mit
      Herz, seit Generationen.
    </Typography>
  </Stack>
);

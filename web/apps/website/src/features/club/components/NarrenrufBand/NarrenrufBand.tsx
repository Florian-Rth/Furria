import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NarrenrufCopy } from './internal/ui/NarrenrufCopy';
import { NarrenrufShout } from './internal/ui/NarrenrufShout';
import { NarrenrufWatermark } from './internal/ui/NarrenrufWatermark';

export const NarrenrufBand: FC = () => (
  <Stack
    component="section"
    data-kk-narrenruf-band
    sx={{
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      px: kkTokens.layout.gutterX,
      py: { xs: 6, md: 10 },
    }}
  >
    <NarrenrufWatermark />
    <Container maxWidth="xl" disableGutters sx={{ position: 'relative', zIndex: 1 }}>
      <Stack
        data-kk-narrenruf-row
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 4, md: 6 },
        }}
      >
        <NarrenrufCopy />
        <NarrenrufShout />
      </Stack>
    </Container>
  </Stack>
);

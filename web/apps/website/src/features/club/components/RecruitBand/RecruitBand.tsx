import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { RecruitActions } from './internal/ui/RecruitActions';
import { RecruitCopy } from './internal/ui/RecruitCopy';
import { RecruitWatermark } from './internal/ui/RecruitWatermark';

export const RecruitBand: FC = () => (
  <Stack
    component="section"
    data-kk-recruit-band
    sx={{
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      px: kkTokens.layout.gutterX,
      py: { xs: 8, md: 12 },
    }}
  >
    <RecruitWatermark />
    <Container maxWidth="xl" disableGutters sx={{ position: 'relative', zIndex: 1 }}>
      <Stack data-kk-recruit-row sx={{ alignItems: 'center', gap: { xs: 4, md: 5 } }}>
        <RecruitCopy />
        <RecruitActions />
      </Stack>
    </Container>
  </Stack>
);

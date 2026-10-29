import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { trackEdgeOf } from '../KkShell/internal/track-edge';

interface KkStudioALayoutProps {
  video: ReactNode;
  stage: ReactNode;
  deck: ReactNode;
  manual: ReactNode;
}

export const KkStudioALayout: FC<KkStudioALayoutProps> = ({ video, stage, deck, manual }) => (
  <Grid container data-kk-studio-a-layout spacing={{ xs: 1.5, desktop: 2 }} sx={{ minWidth: 0 }}>
    <Grid size={{ xs: 12, desktop: 8 }} sx={{ minWidth: 0 }}>
      <Stack sx={{ gap: { xs: 1.5, desktop: 2 }, minWidth: 0 }}>
        <Grid container spacing={{ xs: 0, desktop: 2 }} sx={{ minWidth: 0 }}>
          <Grid size={{ xs: 12, desktop: 6 }} sx={{ minWidth: 0 }}>
            {video}
          </Grid>
          <Grid size={{ xs: 12, desktop: 6 }} sx={{ minWidth: 0, pt: { xs: 1.5, desktop: 0 } }}>
            {stage}
          </Grid>
        </Grid>
        {deck}
      </Stack>
    </Grid>
    <Grid size={{ xs: 12, desktop: 4 }} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          position: { desktop: 'sticky' },
          top: { desktop: trackEdgeOf('top') },
          minWidth: 0,
        }}
      >
        {manual}
      </Box>
    </Grid>
  </Grid>
);

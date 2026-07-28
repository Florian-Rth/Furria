import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { galleryProgramBandContent } from '@/features/gallery/gallery-content';

export const GalleryProgramCopy: FC = () => (
  <Stack sx={{ gap: 1.5, maxWidth: { md: '34rem' } }}>
    <KkEyebrow tone="onAccent">{galleryProgramBandContent.kicker}</KkEyebrow>
    <Typography variant="h2" component="h2" sx={{ textWrap: 'balance' }}>
      {galleryProgramBandContent.headline}
    </Typography>
  </Stack>
);

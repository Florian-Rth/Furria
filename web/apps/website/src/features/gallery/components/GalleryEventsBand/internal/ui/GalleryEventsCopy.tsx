import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { galleryEventsBandContent } from '@/features/gallery/gallery-content';

export const GalleryEventsCopy: FC = () => (
  <Stack sx={{ gap: 1.5, maxWidth: { md: '34rem' } }}>
    <KkEyebrow tone="onAccent">{galleryEventsBandContent.kicker}</KkEyebrow>
    <Typography variant="h2" component="h2" sx={{ textWrap: 'balance' }}>
      {galleryEventsBandContent.headline}
    </Typography>
  </Stack>
);

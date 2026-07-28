import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { GalleryStat } from '@/features/gallery/gallery-content';

interface GalleryStatRowProps {
  stats: GalleryStat[];
}

export const GalleryStatRow: FC<GalleryStatRowProps> = ({ stats }) => (
  <Stack
    direction="row"
    data-kk-gallery-stats
    sx={{
      alignSelf: 'stretch',
      gap: { xs: 3, md: 4 },
      flexWrap: 'wrap',
      borderTop: 1,
      borderColor: 'divider',
      pt: 3,
    }}
  >
    {stats.map((stat) => (
      <Stack key={stat.label} sx={{ gap: 0.5 }}>
        <Typography variant="h4" component="span" sx={{ color: 'primary.main', lineHeight: 1 }}>
          {stat.value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {stat.label}
        </Typography>
      </Stack>
    ))}
  </Stack>
);

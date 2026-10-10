import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkCoverPicture } from '../../../KkCoverPicture';
import type { KkPictureUrls } from '../../../picture-sources';
import { toPictureSourceSet } from '../../../picture-sources';
import { kkTokens } from '../../../tokens';

export interface KkNewsStripPhoto {
  id: number;
  picture: KkPictureUrls;
  aspect: number;
}

const VISIBLE = { xs: 4, sm: 6, md: 8 } as const;
const TILE_SIZES = '(min-width: 900px) 6rem, 25vw';

const displayOf = (index: number): { xs: string; sm: string; md: string } => ({
  xs: index < VISIBLE.xs ? 'block' : 'none',
  sm: index < VISIBLE.sm ? 'block' : 'none',
  md: index < VISIBLE.md ? 'block' : 'none',
});

interface KkNewsTieStripProps {
  photos: readonly KkNewsStripPhoto[];
}

export const KkNewsTieStrip: FC<KkNewsTieStripProps> = ({ photos }) => (
  <Box
    data-kk-news-tie-strip
    sx={{
      width: '100%',
      display: 'grid',
      gap: 0.5,
      gridTemplateColumns: {
        xs: `repeat(${VISIBLE.xs}, minmax(0, 1fr))`,
        sm: `repeat(${VISIBLE.sm}, minmax(0, 1fr))`,
        md: `repeat(${VISIBLE.md}, minmax(0, 1fr))`,
      },
    }}
  >
    {photos.map((photo, index) => (
      <Box
        key={photo.id}
        sx={{
          display: displayOf(index),
          aspectRatio: '1 / 1',
          bgcolor: 'action.hover',
          borderRadius: `${kkTokens.radius.bar}px`,
        }}
      >
        <KkCoverPicture
          source={photo.picture.smallUrl}
          sourceSet={toPictureSourceSet(photo.picture, photo.aspect)}
          sizes={TILE_SIZES}
          alt=""
          sx={{ borderRadius: `${kkTokens.radius.bar}px` }}
        />
      </Box>
    ))}
  </Box>
);

import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkImageSource, KkPictureUrls } from '../../../image-source';
import { toImageSource } from '../../../image-source';
import { KkPhoto } from '../../../KkPhoto';
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

interface StripTile {
  key: number;
  display: { xs: string; sm: string; md: string };
  image: KkImageSource;
}

const tilesOf = (photos: readonly KkNewsStripPhoto[]): StripTile[] =>
  photos.flatMap((photo, index) => {
    const image = toImageSource(photo.picture, photo.aspect, TILE_SIZES);
    return image === null ? [] : [{ key: photo.id, display: displayOf(index), image }];
  });

export const KkNewsTieStrip: FC<KkNewsTieStripProps> = ({ photos }) => {
  const tiles = tilesOf(photos);

  return (
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
      {tiles.map((tile) => (
        <KkPhoto
          key={tile.key}
          alt=""
          image={tile.image}
          aspectRatio="1 / 1"
          sx={{ display: tile.display, borderRadius: `${kkTokens.radius.bar}px` }}
        />
      ))}
    </Box>
  );
};

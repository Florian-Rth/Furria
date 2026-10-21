import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import { KkPhoto } from '../../../KkPhoto';
import { useTileLanding } from '../logic/tile-context';
import { tileLandDelayMs } from '../logic/tile-land';
import { staggeredPop, TILE_INNER_RADIUS } from '../tile-paint';

export interface KkStartTileCover {
  id: string;
  image: KkImageSource | null;
  title: string;
  label: string;
  onSelect: () => void;
}

const POP_AFTER_LAND_MS = 200;

const coversPaint = (count: number, startMs: number): CSSObject => ({
  display: 'grid',
  gridTemplateColumns: count === 1 ? '1fr' : '2fr 1fr',
  gridAutoRows: '1fr',
  gap: 0.5,
  minWidth: 0,
  '& > :first-of-type': { gridRow: count > 2 ? 'span 2' : 'auto' },
  ...staggeredPop('button', startMs),
});

const coverPaint = (theme: Theme): CSSObject => ({
  display: 'block',
  width: '100%',
  height: '100%',
  minHeight: theme.spacing(6),
  borderRadius: TILE_INNER_RADIUS,
  '&:active': { transform: 'scale(0.97)' },
});

const PHOTO_FILL: CSSObject = { borderRadius: TILE_INNER_RADIUS };

interface KkStartTileCoversProps {
  covers: readonly KkStartTileCover[];
}

export const KkStartTileCovers: FC<KkStartTileCoversProps> = ({ covers }) => {
  const { order } = useTileLanding();
  const tiles = covers.map((cover) => (
    <ButtonBase
      key={cover.id}
      data-kk-start-tile-control
      aria-label={cover.label}
      onClick={cover.onSelect}
      sx={coverPaint}
    >
      <KkPhoto alt={cover.title} image={cover.image} fill sx={PHOTO_FILL} />
    </ButtonBase>
  ));

  return (
    <Box
      data-kk-start-tile-covers
      sx={coversPaint(covers.length, tileLandDelayMs(order) + POP_AFTER_LAND_MS)}
    >
      {tiles}
    </Box>
  );
};

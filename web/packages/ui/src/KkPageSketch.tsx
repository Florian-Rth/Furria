import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkPageSketchDevice = 'desktop' | 'phone' | 'share';

export type KkSketchBlockKind = 'bar' | 'headline' | 'text' | 'photo' | 'seal' | 'lit';

export interface KkSketchBlock {
  kind: KkSketchBlockKind;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
}

const { website, gallery } = kkTokens;

const DEVICE_ASPECT: Record<KkPageSketchDevice, string> = {
  desktop: '4 / 5',
  phone: '9 / 16',
  share: '4 / 5',
};

const DEVICE_WIDTH: Record<KkPageSketchDevice, number> = {
  desktop: 1,
  phone: 0.72,
  share: 1,
};

const percent = (value: number): string => `${value}%`;

const blockPaint: Record<KkSketchBlockKind, (theme: Theme) => CSSObject> = {
  bar: () => ({ backgroundColor: website.sketchBlock }),
  headline: () => ({ backgroundColor: website.sketchLine, borderRadius: '1px' }),
  text: () => ({
    backgroundImage: `repeating-linear-gradient(to bottom, ${website.sketchBlock} 0 1px, transparent 1px 3px)`,
  }),
  photo: () => ({ backgroundColor: website.sketchBlock }),
  seal: () => ({ border: `1px solid ${website.sketchLine}`, borderRadius: '50%' }),
  lit: (theme) => ({
    backgroundColor: (theme.vars ?? theme).palette.warning.main,
    boxShadow: `0 0 0 1px ${gallery.darkroom}, 0 0 6px ${(theme.vars ?? theme).palette.warning.main}`,
    zIndex: 1,
  }),
};

interface KkPageSketchProps {
  device: KkPageSketchDevice;
  blocks: readonly KkSketchBlock[];
  sx?: KkSx;
}

export const KkPageSketch: FC<KkPageSketchProps> = ({ device, blocks, sx }) => {
  const shapes = blocks.map((block, index) => (
    <Box
      key={`${block.kind}-${index}`}
      sx={(theme) => ({
        position: 'absolute',
        left: percent(block.x),
        top: percent(block.y),
        width: percent(block.w),
        height: percent(block.h),
        transform: block.rotate === undefined ? 'none' : `rotate(${block.rotate}deg)`,
        ...blockPaint[block.kind](theme),
      })}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-page-sketch={device}
      sx={[
        {
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          width: { xs: website.sketchWidth.xs, desktop: website.sketchWidth.desktop },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          width: percent(DEVICE_WIDTH[device] * 100),
          aspectRatio: DEVICE_ASPECT[device],
          overflow: 'hidden',
          backgroundColor: gallery.darkroom,
          borderRadius: `${kkTokens.radius.bar}px`,
          boxShadow: `inset 0 0 0 1px ${gallery.darkroomEdge}`,
        }}
      >
        {shapes}
      </Box>
    </Box>
  );
};

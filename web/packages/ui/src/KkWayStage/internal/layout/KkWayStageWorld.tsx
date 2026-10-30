import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from '../../../internal/stretched-svg-source';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';
import {
  PERCENT,
  WAY_CAMERA_GLIDE,
  WAY_ZOOM_PROPERTY,
  WAY_ZOOM_REGISTRATION,
} from '../logic/way-zoom';

const VEIL = '16%';

export interface KkWayStageCamera {
  scale: number;
  x: number;
  y: number;
}

interface KkWayStageWorldProps extends PropsWithChildren {
  label: string;
  camera: KkWayStageCamera;
  artworkSvg: string | null;
}

export const KkWayStageWorld: FC<KkWayStageWorldProps> = ({
  label,
  camera,
  artworkSvg,
  children,
}) => {
  const source = stretchedSvgSourceOf(artworkSvg);
  const artwork =
    source === null ? null : (
      <KkPhoto
        alt=""
        image={{ src: source }}
        fit="fill"
        fill
        priority
        sx={{ position: 'absolute', inset: 0, transform: 'rotate(180deg)', pointerEvents: 'none' }}
      />
    );
  const lens = {
    transform: `translate(${camera.x * PERCENT}%, ${camera.y * PERCENT}%) scale(${camera.scale})`,
    [WAY_ZOOM_PROPERTY]: String(camera.scale),
  };

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-way-world
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        overflow: 'clip',
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: kkTokens.shadow.raised,
      })}
    >
      <GlobalStyles styles={WAY_ZOOM_REGISTRATION} />
      <Box
        style={lens}
        sx={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          transition: `transform ${WAY_CAMERA_GLIDE}, ${WAY_ZOOM_PROPERTY} ${WAY_CAMERA_GLIDE}`,
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, '& > *': { borderRadius: 0 } }}>
          {artwork}
          <Box
            sx={(theme) => ({
              position: 'absolute',
              inset: 0,
              backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} ${VEIL}, transparent)`,
            })}
          />
          <Box
            sx={(theme) => ({
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: kkTokens.line.page,
              backgroundColor: (theme.vars ?? theme).palette.text.primary,
            })}
          />
        </Box>
        <Box
          aria-hidden
          data-kk-way-field
          sx={{ position: 'absolute', inset: 0, containerType: 'size', pointerEvents: 'none' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

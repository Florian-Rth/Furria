import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkCrop } from '../crop-frame';
import { KK_CROP_MAX_ZOOM, KK_CROP_MIN_ZOOM, placeCropImage } from '../crop-frame';
import { focusRing } from '../internal/focus-ring';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkCropFrameGuide } from './KkCropFrameGuide';
import { useCropFrame } from './use-crop-frame';

const ZOOM_STEP = 0.01;

export type KkCropGuide = 'circle' | 'none';

export interface KkCropFrameLabels {
  frame: string;
  zoom: string;
}

interface KkCropFrameProps {
  source: string;
  alt: string;
  aspect: number;
  initialCrop?: KkCrop | null;
  guide?: KkCropGuide;
  labels: KkCropFrameLabels;
  onCropChange: (crop: KkCrop) => void;
  onUnreadable?: () => void;
  sx?: KkSx;
}

export const KkCropFrame: FC<KkCropFrameProps> = ({
  source,
  alt,
  aspect,
  initialCrop = null,
  guide = 'none',
  labels,
  onCropChange,
  onUnreadable,
  sx,
}) => {
  const frame = useCropFrame({ aspect, initialCrop, onCropChange });
  const placement = frame.crop === null ? { opacity: 0 } : placeCropImage(frame.crop);
  const guideLayer = guide === 'circle' ? <KkCropFrameGuide /> : null;

  const handleZoom = (_: Event, value: number | number[]): void => {
    frame.onZoomChange(Array.isArray(value) ? (value[0] ?? KK_CROP_MIN_ZOOM) : value);
  };

  return (
    <Stack data-kk-crop-frame sx={[{ gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        role="group"
        aria-label={labels.frame}
        tabIndex={0}
        onPointerDown={frame.onPointerDown}
        onPointerMove={frame.onPointerMove}
        onPointerUp={frame.onPointerUp}
        onPointerCancel={frame.onPointerUp}
        onWheel={frame.onWheel}
        onKeyDown={frame.onKeyDown}
        sx={(theme: Theme) => ({
          position: 'relative',
          width: '100%',
          aspectRatio: String(aspect),
          borderRadius: `${kkTokens.radius.base}px`,
          touchAction: 'none',
          cursor: 'grab',
          userSelect: 'none',
          '&:active': { cursor: 'grabbing' },
          ...focusRing(theme),
        })}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            clipPath: `inset(0 round ${kkTokens.radius.base}px)`,
            backgroundColor: 'action.hover',
          }}
        >
          <Box
            component="img"
            src={source}
            alt={alt}
            draggable={false}
            onLoad={frame.onImageLoad}
            onError={onUnreadable}
            sx={{
              position: 'absolute',
              display: 'block',
              maxWidth: 'none',
              pointerEvents: 'none',
              ...placement,
            }}
          />
          {guideLayer}
        </Box>
      </Box>
      <Slider
        aria-label={labels.zoom}
        min={KK_CROP_MIN_ZOOM}
        max={KK_CROP_MAX_ZOOM}
        step={ZOOM_STEP}
        value={frame.zoom}
        onChange={handleZoom}
        disabled={frame.crop === null}
      />
    </Stack>
  );
};

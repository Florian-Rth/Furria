import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkBandWatermarkSide = 'left' | 'right' | 'center';
type KkBandWatermarkTone = 'onAccent' | 'ink';

interface KkBandWatermarkProps {
  side?: KkBandWatermarkSide;
  tone?: KkBandWatermarkTone;
  size?: number;
  sx?: KkSx;
}

const WATERMARK_SIZE = 300;

const WATERMARK_INSET = { xs: -56, md: '6%' };

const placements = {
  left: { left: WATERMARK_INSET, transform: 'translateY(-50%) rotate(-12deg)' },
  right: { right: WATERMARK_INSET, transform: 'translateY(-50%) rotate(-12deg)' },
  center: { left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)' },
} as const;

const toneColors: Record<KkBandWatermarkTone, string> = {
  onAccent: 'primary.contrastText',
  ink: 'text.primary',
};

export const KkBandWatermark: FC<KkBandWatermarkProps> = ({
  side = 'right',
  tone = 'onAccent',
  size = WATERMARK_SIZE,
  sx,
}) => (
  <Box
    data-kk-band-watermark
    aria-hidden
    sx={[
      placements[side],
      (theme) => ({
        position: 'absolute',
        top: '50%',
        color: toneColors[tone],
        opacity: kkTokens.opacity.watermark,
        pointerEvents: 'none',
        zIndex: 0,
        ...theme.applyStyles('dark', { opacity: kkTokens.opacity.watermarkDark }),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkBroomMark size={size} />
  </Box>
);

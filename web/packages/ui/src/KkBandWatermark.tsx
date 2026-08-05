import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkBroomMark } from './KkBroomMark';
import { kkTokens } from './tokens';

type KkBandWatermarkSide = 'left' | 'right' | 'center';

interface KkBandWatermarkProps {
  side?: KkBandWatermarkSide;
}

const WATERMARK_SIZE = 300;

const WATERMARK_INSET = { xs: -56, md: '6%' };

const placements = {
  left: { left: WATERMARK_INSET, transform: 'translateY(-50%) rotate(-12deg)' },
  right: { right: WATERMARK_INSET, transform: 'translateY(-50%) rotate(-12deg)' },
  center: { left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)' },
} as const;

export const KkBandWatermark: FC<KkBandWatermarkProps> = ({ side = 'right' }) => (
  <Box
    data-kk-band-watermark
    aria-hidden
    sx={[
      placements[side],
      {
        position: 'absolute',
        top: '50%',
        color: 'primary.contrastText',
        opacity: kkTokens.opacity.watermark,
        pointerEvents: 'none',
        zIndex: 0,
      },
    ]}
  >
    <KkBroomMark size={WATERMARK_SIZE} />
  </Box>
);

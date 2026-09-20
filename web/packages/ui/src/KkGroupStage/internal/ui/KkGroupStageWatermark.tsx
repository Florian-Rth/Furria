import Box from '@mui/material/Box';
import type { FC } from 'react';
import { applyScheme } from '../../../internal/scheme-paint';
import { watermarkOpacityScheme } from '../../../internal/watermark-paint';
import { KkBroomMark } from '../../../KkBroomMark';

const MARK_SIZE = { xs: 200, desktop: 300 };
const PLACEMENT = { bottom: '-34%', right: '-6%' };
const TILT = 'rotate(-14deg)';

export const KkGroupStageWatermark: FC = () => (
  <Box
    aria-hidden
    data-kk-group-stage-watermark
    sx={(theme) => ({
      position: 'absolute',
      ...PLACEMENT,
      zIndex: 1,
      transform: TILT,
      color: 'inherit',
      pointerEvents: 'none',
      ...applyScheme(theme, watermarkOpacityScheme),
    })}
  >
    <KkBroomMark size={MARK_SIZE.xs} sx={{ display: { xs: 'block', desktop: 'none' } }} />
    <KkBroomMark size={MARK_SIZE.desktop} sx={{ display: { xs: 'none', desktop: 'block' } }} />
  </Box>
);

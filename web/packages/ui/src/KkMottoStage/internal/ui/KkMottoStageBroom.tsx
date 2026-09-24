import Box from '@mui/material/Box';
import type { FC } from 'react';
import { applyScheme } from '../../../internal/scheme-paint';
import { bandWatermarkOpacityScheme } from '../../../internal/watermark-paint';
import { KkBroomMark } from '../../../KkBroomMark';

const MARK_WIDTH = { xs: '58%', desktop: '21%' };
const MARK_RIGHT = { xs: '-6%', desktop: '17%' };
const MARK_TILT = 'translateY(-50%) rotate(-12deg)';

export const KkMottoStageBroom: FC = () => (
  <Box
    aria-hidden
    data-kk-motto-stage-broom
    sx={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark
      sx={(theme) => ({
        position: 'absolute',
        top: '50%',
        right: MARK_RIGHT,
        width: MARK_WIDTH,
        height: 'auto',
        color: 'text.primary',
        transform: MARK_TILT,
        ...applyScheme(theme, bandWatermarkOpacityScheme),
      })}
    />
  </Box>
);

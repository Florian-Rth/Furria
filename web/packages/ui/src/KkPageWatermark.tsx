import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { applyScheme } from './internal/scheme-paint';
import { watermarkOpacityScheme } from './internal/watermark-paint';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';

const MARK_SIZE = { xs: 150, desktop: 230 };

interface KkPageWatermarkProps {
  sx?: KkSx;
}

export const KkPageWatermark: FC<KkPageWatermarkProps> = ({ sx }) => (
  <Stack
    aria-hidden
    data-kk-page-watermark
    sx={[
      (theme) => ({
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.primary',
        pointerEvents: 'none',
        py: { xs: 4, desktop: 8 },
        ...applyScheme(theme, watermarkOpacityScheme),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Stack sx={{ display: { xs: 'flex', desktop: 'none' } }}>
      <KkBroomMark size={MARK_SIZE.xs} />
    </Stack>
    <Stack sx={{ display: { xs: 'none', desktop: 'flex' } }}>
      <KkBroomMark size={MARK_SIZE.desktop} />
    </Stack>
  </Stack>
);

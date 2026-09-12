import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const MARK_SIZE = { xs: 150, desktop: 230 };

interface KkPageWatermarkProps {
  sx?: KkSx;
}

export const KkPageWatermark: FC<KkPageWatermarkProps> = ({ sx }) => (
  <Stack
    aria-hidden
    data-kk-page-watermark
    sx={[
      {
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.primary',
        opacity: kkTokens.opacity.watermark,
        pointerEvents: 'none',
        py: { xs: 4, desktop: 8 },
      },
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

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkBandWatermark } from '../../../KkBandWatermark';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { KkAppShellGlow } from '../ui/KkAppShellGlow';

const GLOW = {
  mobile: { width: 340, height: 320, top: -120, right: -70 },
  desktop: { width: 520, height: 460, top: -160, right: -40 },
} as const;

const STAGE_Z_INDEX = 1;
const WATERMARK_Z_INDEX = -1;
const WATERMARK_SIZE = { xs: 220, desktop: 300 };

interface KkAppShellStageProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellStage: FC<KkAppShellStageProps> = ({ sx, children }) => (
  <Stack
    data-kk-app-shell-stage
    sx={[
      (theme) => ({
        position: 'relative',
        isolation: 'isolate',
        zIndex: STAGE_Z_INDEX,
        overflow: 'hidden',
        backgroundColor: kkTokens.chrome.light.base,
        backgroundImage: kkTokens.chrome.light.gradient,
        boxShadow: kkTokens.chrome.light.lift,
        ...theme.applyStyles('dark', {
          backgroundColor: kkTokens.chrome.dark.base,
          backgroundImage: kkTokens.chrome.dark.gradient,
          boxShadow: kkTokens.chrome.dark.lift,
        }),
        color: 'text.primary',
        px: { xs: 2.5, desktop: 5 },
        pt: { xs: 0.75, desktop: 3.25 },
        pb: { xs: 2.75, desktop: 3.75 },
        gap: { xs: 2.75, desktop: 0 },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Stack sx={{ display: { xs: 'flex', desktop: 'none' } }}>
      <KkAppShellGlow tone="red" {...GLOW.mobile} />
      <KkBandWatermark
        side="right"
        tone="ink"
        size={WATERMARK_SIZE.xs}
        sx={{ zIndex: WATERMARK_Z_INDEX }}
      />
    </Stack>
    <Stack sx={{ display: { xs: 'none', desktop: 'flex' } }}>
      <KkAppShellGlow tone="red" {...GLOW.desktop} />
      <KkBandWatermark
        side="right"
        tone="ink"
        size={WATERMARK_SIZE.desktop}
        sx={{ zIndex: WATERMARK_Z_INDEX }}
      />
    </Stack>
    {children}
  </Stack>
);

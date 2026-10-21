import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea, safeAreaInset } from '../../../internal/safe-area';
import { KkBrandStageGlow } from '../../../KkBrandStage/internal/ui/KkBrandStageGlow';
import { KkConfettiRain } from '../../../KkConfettiRain';
import { KkPageWatermark } from '../../../KkPageWatermark';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const CONFETTI_COUNT = 16;
const CONTENT_WIDTH = '30rem';
const TOP_GAP = 14;
const BOTTOM_GAP = 32;

interface KkInstallStageRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkInstallStageRoot: FC<KkInstallStageRootProps> = ({ sx, children }) => (
  <Stack
    component="main"
    data-kk-install-stage
    sx={[
      (theme) => ({
        position: 'relative',
        isolation: 'isolate',
        minHeight: '100dvh',
        backgroundColor: kkTokens.chrome.light.base,
        backgroundImage: kkTokens.chrome.light.gradient,
        ...theme.applyStyles('dark', {
          backgroundColor: kkTokens.chrome.dark.base,
          backgroundImage: kkTokens.chrome.dark.gradient,
        }),
        color: 'text.primary',
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkBrandStageGlow />
    <KkConfettiRain count={CONFETTI_COUNT} fadeOut />
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: safeAreaInset('bottom'),
        zIndex: -1,
      }}
    >
      <KkPageWatermark />
    </Box>
    <Stack
      sx={{
        width: '100%',
        maxWidth: CONTENT_WIDTH,
        mx: 'auto',
        px: 2,
        pt: safeArea('top', TOP_GAP),
        pb: safeArea('bottom', BOTTOM_GAP),
        rowGap: 3,
      }}
    >
      {children}
    </Stack>
  </Stack>
);

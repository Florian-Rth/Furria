import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkConfettiRain } from '../../../KkConfettiRain';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { KkBrandStageClubName } from '../ui/KkBrandStageClubName';
import { KkBrandStageGlow } from '../ui/KkBrandStageGlow';
import { KkBrandStageNarrenruf } from '../ui/KkBrandStageNarrenruf';
import { KkBrandStageRule } from '../ui/KkBrandStageRule';
import { KkBrandStageWordmark } from '../ui/KkBrandStageWordmark';
import { KkBrandStageBrand } from './KkBrandStageBrand';
import { KkBrandStageReveal } from './KkBrandStageReveal';

interface KkBrandStageRootProps extends PropsWithChildren {
  sx?: KkSx;
}

const CONFETTI_COUNT = 14;

export const KkBrandStageRoot: FC<KkBrandStageRootProps> = ({ sx, children }) => (
  <Stack
    data-kk-brand-stage
    sx={[
      (theme) => ({
        position: 'relative',
        isolation: 'isolate',
        flex: 1,
        minWidth: 0,
        minHeight: '100%',
        backgroundColor: kkTokens.chrome.light.base,
        backgroundImage: kkTokens.chrome.light.gradient,
        boxShadow: kkTokens.chrome.light.lift,
        ...theme.applyStyles('dark', {
          backgroundColor: kkTokens.chrome.dark.base,
          backgroundImage: kkTokens.chrome.dark.gradient,
          boxShadow: kkTokens.chrome.dark.lift,
        }),
        color: 'text.primary',
        borderRight: { xs: 0, desktop: kkTokens.line.hair },
        borderRightStyle: 'solid',
        borderColor: 'divider',
        px: { xs: 3, desktop: 5 },
        py: { xs: 4, desktop: 4.5 },
        gap: 3,
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkBrandStageGlow />
    <KkConfettiRain count={CONFETTI_COUNT} fadeOut />
    {children}
    <KkBrandStageBrand>
      <KkBrandStageReveal step={0}>
        <KkBrandStageWordmark />
      </KkBrandStageReveal>
      <KkBrandStageReveal step={1} motion="wipe">
        <KkBrandStageRule />
      </KkBrandStageReveal>
      <KkBrandStageReveal step={2}>
        <KkBrandStageClubName />
      </KkBrandStageReveal>
      <KkBrandStageReveal step={3}>
        <KkBrandStageNarrenruf />
      </KkBrandStageReveal>
    </KkBrandStageBrand>
  </Stack>
);

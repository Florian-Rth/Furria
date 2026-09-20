import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { mottoStageMotionOf } from '../logic/motto-stage-motion';
import type { KkMottoStageState } from '../motto-stage-state';
import { KkMottoStageCountdown } from '../ui/KkMottoStageCountdown';
import { KkMottoStageGlow } from '../ui/KkMottoStageGlow';
import { KkMottoStageMeta } from '../ui/KkMottoStageMeta';
import { KkMottoStageMotto } from '../ui/KkMottoStageMotto';
import { KkMottoStageProgress } from '../ui/KkMottoStageProgress';
import { KkMottoStageSeal } from '../ui/KkMottoStageSeal';

const rise = keyframes`
  from { opacity: 0; transform: translate3d(0, 1.25rem, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const OPENING_DATE_LABEL = '11.11.';
const REVEAL_SECONDS = 0.72;
const BASE_DELAY_SECONDS = 0.08;
const STEP_DELAY_SECONDS = 0.14;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
const MIN_HEIGHT_SPACING = { xs: 24, desktop: 30 };
const STILL: KkSx = {};

const META_STEP = 0;
const MOTTO_STEP = 1;
const SEAL_STEP = 2;
const COUNTDOWN_STEP = 3;
const PROGRESS_STEP = 4;

const revealAt = (step: number, reveal: boolean): KkSx => {
  if (!reveal) {
    return STILL;
  }

  return {
    animation: `${rise} ${REVEAL_SECONDS}s ${EASING} both`,
    animationDelay: `${BASE_DELAY_SECONDS + step * STEP_DELAY_SECONDS}s`,
    [REDUCED_MOTION]: { animation: 'none' },
  };
};

interface KkMottoStageRootProps extends PropsWithChildren {
  state: KkMottoStageState;
  sessionLabel: string;
  motto: string | null;
  numberLabel: string | null;
  countdownLabel: string | null;
  progress: number | null;
  sx?: KkSx;
}

export const KkMottoStageRoot: FC<KkMottoStageRootProps> = ({
  state,
  sessionLabel,
  motto,
  numberLabel,
  countdownLabel,
  progress,
  sx,
  children,
}) => {
  const reducedMotion = useReducedMotion();
  const motion = mottoStageMotionOf(state, reducedMotion);
  const scene = state === 'running' ? children : null;
  const sealed = state === 'teaser' && countdownLabel !== null;
  const seal = sealed ? (
    <KkMottoStageSeal
      dateLabel={OPENING_DATE_LABEL}
      caption={countdownLabel}
      sx={revealAt(SEAL_STEP, motion.reveal)}
    />
  ) : null;
  const countdownLine = sealed ? null : (
    <KkMottoStageCountdown
      countdownLabel={countdownLabel}
      sx={revealAt(COUNTDOWN_STEP, motion.reveal)}
    />
  );

  return (
    <Stack
      data-kk-motto-stage
      sx={[
        (theme) => ({
          position: 'relative',
          isolation: 'isolate',
          minWidth: 0,
          minHeight: {
            xs: theme.spacing(MIN_HEIGHT_SPACING.xs),
            desktop: theme.spacing(MIN_HEIGHT_SPACING.desktop),
          },
          justifyContent: 'flex-end',
          borderRadius: `${kkTokens.radius.base}px`,
          border: `${kkTokens.line.hair}px solid`,
          borderColor: 'divider',
          color: 'text.primary',
          backgroundColor: kkTokens.chrome.light.base,
          backgroundImage: kkTokens.chrome.light.gradient,
          boxShadow: kkTokens.chrome.light.lift,
          ...theme.applyStyles('dark', {
            backgroundColor: kkTokens.chrome.dark.base,
            backgroundImage: kkTokens.chrome.dark.gradient,
            boxShadow: kkTokens.chrome.dark.lift,
          }),
          px: { xs: 3, desktop: 4 },
          py: { xs: 3, desktop: 4 },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkMottoStageGlow ambient={motion.ambient} />
      {scene}
      <Stack sx={{ position: 'relative', zIndex: 1, minWidth: 0, gap: { xs: 2, desktop: 2.5 } }}>
        <KkMottoStageMeta
          sessionLabel={sessionLabel}
          numberLabel={numberLabel}
          sx={revealAt(META_STEP, motion.reveal)}
        />
        <Stack
          direction={{ xs: 'column', desktop: 'row' }}
          sx={{
            gap: { xs: 2.5, desktop: 4 },
            alignItems: { xs: 'flex-start', desktop: 'center' },
            justifyContent: 'space-between',
            minWidth: 0,
          }}
        >
          <KkMottoStageMotto motto={motto} sx={revealAt(MOTTO_STEP, motion.reveal)} />
          {seal}
        </Stack>
        {countdownLine}
        <KkMottoStageProgress progress={progress} sx={revealAt(PROGRESS_STEP, motion.reveal)} />
      </Stack>
    </Stack>
  );
};

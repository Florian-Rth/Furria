import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkSx } from '../../../kk-sx';
import { logoSourceOf } from '../logic/logo-source';
import { mottoStageMotionOf } from '../logic/motto-stage-motion';
import {
  MOTTO_STAGE_CONTENT_GAP,
  MOTTO_STAGE_HEADLINE_GAP,
  MOTTO_STAGE_TEXT_WIDTH,
  mottoStageChrome,
} from '../motto-stage-chrome';
import type { KkMottoStageState } from '../motto-stage-state';
import { KkMottoStageBroom } from '../ui/KkMottoStageBroom';
import { KkMottoStageBucket } from '../ui/KkMottoStageBucket';
import { KkMottoStageConfetti } from '../ui/KkMottoStageConfetti';
import { KkMottoStageCountdown } from '../ui/KkMottoStageCountdown';
import { KkMottoStageGlow } from '../ui/KkMottoStageGlow';
import { KkMottoStageLogo } from '../ui/KkMottoStageLogo';
import { KkMottoStageMeta } from '../ui/KkMottoStageMeta';
import { KkMottoStageMotto } from '../ui/KkMottoStageMotto';
import { KkMottoStageProgress } from '../ui/KkMottoStageProgress';

const rise = keyframes`
  from { opacity: 0; transform: translate3d(0, 1.25rem, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const REVEAL_SECONDS = 0.72;
const BASE_DELAY_SECONDS = 0.08;
const STEP_DELAY_SECONDS = 0.14;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
const STILL: KkSx = {};

const META_STEP = 0;
const MOTTO_STEP = 1;
const COUNTDOWN_STEP = 2;
const PROGRESS_STEP = 3;

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
  mottoPendingLabel: string;
  numberLabel: string | null;
  countdownLabel: string | null;
  progress: number | null;
  logo: string | null;
  sx?: KkSx;
}

export const KkMottoStageRoot: FC<KkMottoStageRootProps> = ({
  state,
  sessionLabel,
  motto,
  mottoPendingLabel,
  numberLabel,
  countdownLabel,
  progress,
  logo,
  sx,
  children,
}) => {
  const reducedMotion = useReducedMotion();
  const motion = mottoStageMotionOf(state, reducedMotion);
  const isRunning = state === 'running';
  const logoSource = logoSourceOf(logo);
  const scene = isRunning ? children : null;
  const logoArtwork = logoSource === null ? null : <KkMottoStageLogo source={logoSource} />;
  const artworkByState: Record<KkMottoStageState, ReactNode> = {
    teaser: logoArtwork,
    running: <KkMottoStageConfetti />,
    resting: (
      <>
        <KkMottoStageBroom />
        <KkMottoStageBucket />
      </>
    ),
  };
  const artwork = artworkByState[state];

  return (
    <Stack data-kk-motto-stage sx={[mottoStageChrome, ...(Array.isArray(sx) ? sx : [sx])]}>
      <KkMottoStageGlow ambient={motion.ambient} />
      {scene}
      {artwork}
      <Stack sx={{ position: 'relative', zIndex: 1, minWidth: 0, gap: MOTTO_STAGE_CONTENT_GAP }}>
        <KkMottoStageMeta
          sessionLabel={sessionLabel}
          numberLabel={numberLabel}
          sx={revealAt(META_STEP, motion.reveal)}
        />
        <Stack
          sx={{ minWidth: 0, maxWidth: MOTTO_STAGE_TEXT_WIDTH, gap: MOTTO_STAGE_HEADLINE_GAP }}
        >
          <KkMottoStageMotto
            motto={motto}
            pendingLabel={mottoPendingLabel}
            sx={revealAt(MOTTO_STEP, motion.reveal)}
          />
          <KkMottoStageCountdown
            countdownLabel={countdownLabel}
            sx={revealAt(COUNTDOWN_STEP, motion.reveal)}
          />
        </Stack>
        <KkMottoStageProgress progress={progress} sx={revealAt(PROGRESS_STEP, motion.reveal)} />
      </Stack>
    </Stack>
  );
};

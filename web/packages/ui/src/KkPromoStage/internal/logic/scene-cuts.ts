import type { TargetAndTransition, Transition } from 'motion/react';
import { kkTokens } from '../../../tokens';
import type { KkPromoCut, KkPromoPoint, KkPromoScenePhase } from '../../promo-stage-types';
import { PROMO_CANVAS } from '../promo-paint';

export const PROMO_CUT_SECONDS: Record<KkPromoCut, number> = {
  hard: 0,
  mask: 0.95,
  whip: 0.6,
  wipe: 0.75,
  match: 0.4,
};

const SHARP = [0.83, 0, 0.17, 1] as const;
const OPEN = [0.76, 0, 0.24, 1] as const;
const CLOSED_INSET = 'inset(0% 100% 0% 0%)';
const OPEN_INSET = 'inset(0% 0% 0% 0%)';
const WHIP_BLUR = 'blur(22px)';
const SHARP_FOCUS = 'blur(0px)';
const VEIL = kkTokens.color.light.bg;
const CLEAR = 'rgba(241,242,244,0)';

const circleAt = (radius: number, origin: KkPromoPoint): string =>
  `circle(${radius}% at ${origin.x}% ${origin.y}%)`;

const enteringFrom = (cut: KkPromoCut, origin: KkPromoPoint): TargetAndTransition => {
  switch (cut) {
    case 'mask':
      return { clipPath: circleAt(0, origin) };
    case 'whip':
      return { x: PROMO_CANVAS.width, filter: WHIP_BLUR };
    case 'wipe':
      return { clipPath: CLOSED_INSET };
    case 'match':
      return { opacity: 0, scale: 1.035 };
    case 'hard':
      return {};
  }
};

const shown = (cut: KkPromoCut, origin: KkPromoPoint): TargetAndTransition => {
  switch (cut) {
    case 'mask':
      return { clipPath: circleAt(150, origin) };
    case 'whip':
      return { x: 0, filter: SHARP_FOCUS };
    case 'wipe':
      return { clipPath: OPEN_INSET };
    case 'match':
      return { opacity: 1, scale: 1 };
    case 'hard':
      return {};
  }
};

const leaving = (cut: KkPromoCut): TargetAndTransition => {
  switch (cut) {
    case 'whip':
      return { x: -PROMO_CANVAS.width, filter: WHIP_BLUR };
    case 'match':
      return { opacity: 0, scale: 0.985 };
    case 'mask':
      return { scale: 0.94, filter: 'brightness(0.86)' };
    case 'wipe':
      return { x: -120 };
    case 'hard':
      return {};
  }
};

const cutTransition = (cut: KkPromoCut): Transition => ({
  duration: PROMO_CUT_SECONDS[cut],
  ease: cut === 'mask' ? OPEN : SHARP,
});

export const sceneMotionOf = (
  phase: KkPromoScenePhase,
  cut: KkPromoCut,
  origin: KkPromoPoint,
): TargetAndTransition => {
  const seconds = PROMO_CUT_SECONDS[cut];

  if (phase === 'waiting') {
    return {
      ...enteringFrom(cut, origin),
      visibility: 'hidden',
      backgroundColor: VEIL,
      transition: { duration: 0 },
    };
  }

  if (phase === 'live') {
    return {
      ...shown(cut, origin),
      visibility: 'visible',
      backgroundColor: CLEAR,
      transition: {
        ...cutTransition(cut),
        visibility: { duration: 0 },
        backgroundColor: { delay: seconds, duration: 0 },
      },
    };
  }

  return {
    ...leaving(cut),
    visibility: 'hidden',
    transition: { ...cutTransition(cut), visibility: { delay: seconds, duration: 0 } },
  };
};

import type { MotionValue } from 'motion/react';
import { useScroll, useTransform } from 'motion/react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { useIsWideScreen } from '../../../use-is-wide-screen';
import type { PlateInking } from '../plate-paint';
import type { ArtPlacement, KkPosterPhase } from './poster-composition';
import { artCompositionOf } from './poster-composition';
import { posterPlatesOf } from './poster-foot';

export interface PosterArtView {
  parallax: MotionValue<number>;
  placements: ArtPlacement[];
  plates: PlateInking[];
}

export interface PosterArtRequest {
  phase: KkPosterPhase;
  runUp: number;
  evening: boolean;
}

const PARALLAX_SHARE = -0.3;
const STILL = 0;

export const usePosterArt = ({ phase, runUp, evening }: PosterArtRequest): PosterArtView => {
  const wide = useIsWideScreen();
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, (scrolled: number): number =>
    wide && !reduced ? scrolled * PARALLAX_SHARE : STILL,
  );

  return {
    parallax,
    placements: artCompositionOf(phase, runUp),
    plates: posterPlatesOf(phase, evening),
  };
};

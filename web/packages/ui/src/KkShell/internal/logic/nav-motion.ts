import type { TargetAndTransition, Transition } from 'motion/react';
import { kkTokens } from '../../../tokens';

const { nav } = kkTokens.shell;

export interface KkNavLabelPose {
  opacity: number;
  y: number;
}

const GLIDE: Transition = { type: 'spring', stiffness: 460, damping: 40, mass: 0.9 };
const POP: Transition = { type: 'spring', stiffness: 700, damping: 17, mass: 0.6 };
const SNAP: Transition = { duration: 0 };

export const NAV_AT_REST: TargetAndTransition = { opacity: 1, y: 0 };
export const NAV_SUNKEN: TargetAndTransition = { opacity: 0, y: nav.sink };

export const navGlide = (reducedMotion: boolean): Transition => (reducedMotion ? SNAP : GLIDE);

export const navPop = (reducedMotion: boolean): Transition => (reducedMotion ? SNAP : POP);

export const navGlyphPose = (active: boolean): TargetAndTransition =>
  active ? { scale: nav.glyphScale, y: -nav.glyphLift } : { scale: 1, y: 0 };

export const navLabelPose = (active: boolean): KkNavLabelPose =>
  active ? { opacity: 1, y: 0 } : { opacity: nav.labelRestOpacity, y: nav.labelDrift };

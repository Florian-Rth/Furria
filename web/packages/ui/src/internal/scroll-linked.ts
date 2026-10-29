import type { CSSObject as KkKeyframeObject } from '@emotion/react';
import { keyframes } from '@emotion/react';
import type { CSSObject } from '@mui/material/styles';

export type KkScrollSnap = 'ramped' | 'instant-when-reduced';

export type KkScrollFrame = (scrollOffset: number) => KkKeyframeObject;

export type KkScrollKeyframes = ReturnType<typeof keyframes>;

const SCROLL_TIMELINE = '(animation-timeline: scroll()) and (animation-range: 0px 1px)';
const WEBKIT_ONLY_FEATURE = '(hanging-punctuation: first)';
const SCROLL_DRIVEN_CONDITION = `${SCROLL_TIMELINE} and ${WEBKIT_ONLY_FEATURE}`;
const SCROLL_DRIVEN = `@supports ${SCROLL_DRIVEN_CONDITION}`;
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
const PERCENT = 100;
const STOP_PRECISION = 10_000;
const FIRST_PIXEL = 1;

const percentOf = (scrollOffset: number, travel: number): string => {
  const share = Math.min(Math.max(scrollOffset / travel, 0), 1);

  return `${Math.round(share * PERCENT * STOP_PRECISION) / STOP_PRECISION}%`;
};

export const scrollStopsOf = (
  travel: number,
  scrollOffsets: readonly number[],
  frameAt: KkScrollFrame,
): KkKeyframeObject =>
  Object.fromEntries(
    scrollOffsets.map((scrollOffset) => [percentOf(scrollOffset, travel), frameAt(scrollOffset)]),
  );

export const scrollKeyframesOf = (
  travel: number,
  scrollOffsets: readonly number[],
  frameAt: KkScrollFrame,
): KkScrollKeyframes => keyframes(scrollStopsOf(travel, scrollOffsets, frameAt));

const snapOf = (snap: KkScrollSnap): CSSObject =>
  snap === 'instant-when-reduced'
    ? { [REDUCED_MOTION]: { animationRange: `0px ${FIRST_PIXEL}px` } }
    : {};

export const scrollLinkedPaint = (
  frames: KkScrollKeyframes,
  travel: number,
  snap: KkScrollSnap,
): CSSObject => ({
  [SCROLL_DRIVEN]: {
    animation: `${frames} 1ms linear both`,
    animationDuration: 'auto',
    animationTimeline: 'scroll(root block)',
    animationRange: `0px ${travel}px`,
    ...snapOf(snap),
  },
});

export const supportsScrollDriven = (): boolean =>
  typeof CSS !== 'undefined' && CSS.supports(SCROLL_DRIVEN_CONDITION);

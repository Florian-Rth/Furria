import type { CSSObject } from '@mui/material/styles';

export const LESSON_CONTAINER = 'kk-lesson';
export const LESSON_PICTURE_CONTAINER = 'kk-lesson-picture';

export const LESSON_WIDE = `@container ${LESSON_CONTAINER} (min-aspect-ratio: 5/4)`;
export const LESSON_WIDE_TALL = `@container ${LESSON_CONTAINER} (min-aspect-ratio: 5/4) and (min-height: 34rem)`;
export const LESSON_TALL = `@container ${LESSON_CONTAINER} (max-aspect-ratio: 5/4) and (min-height: 44rem)`;
export const LESSON_CRAMPED = `@container ${LESSON_CONTAINER} (max-width: 16rem) or (max-height: 16rem)`;
export const LESSON_NARROW = `@container ${LESSON_CONTAINER} (max-width: 21rem)`;

const INSET_GAP = '0.5rem';
const INSET_WIDTH_SHARE = 44;
const INSET_HEIGHT_SHARE = 52;
const WIDE_INSET_WIDTH_SHARE = 36;
const WIDE_INSET_HEIGHT_SHARE = 48;
const SWAP_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

export const LESSON_SWAP_MOTION = `width 420ms ${SWAP_EASE}, height 420ms ${SWAP_EASE}, right 420ms ${SWAP_EASE}, bottom 420ms ${SWAP_EASE}, border-radius 420ms ${SWAP_EASE}, opacity 240ms ease-out, visibility 0s`;

const sizedInset = (aspect: number, widthShare: number, heightShare: number): CSSObject => {
  const width = `min(${widthShare}cqw, calc(${heightShare}cqh * ${aspect}))`;

  return { width, height: `calc(${width} / ${aspect})` };
};

export const insetBoxOf = (aspect: number): CSSObject => ({
  right: INSET_GAP,
  bottom: INSET_GAP,
  ...sizedInset(aspect, INSET_WIDTH_SHARE, INSET_HEIGHT_SHARE),
  [LESSON_WIDE]: sizedInset(aspect, WIDE_INSET_WIDTH_SHARE, WIDE_INSET_HEIGHT_SHARE),
});

export const MAIN_BOX: CSSObject = {
  right: 0,
  bottom: 0,
  width: '100cqw',
  height: '100cqh',
};

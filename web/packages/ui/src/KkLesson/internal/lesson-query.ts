import type { CSSObject } from '@mui/material/styles';

export const LESSON_CONTAINER = 'kk-lesson';
export const LESSON_PICTURE_CONTAINER = 'kk-lesson-picture';

export const LESSON_WIDE = `@container ${LESSON_CONTAINER} (min-aspect-ratio: 5/4)`;
export const LESSON_WIDE_TALL = `@container ${LESSON_CONTAINER} (min-aspect-ratio: 5/4) and (min-height: 34rem)`;
export const LESSON_WIDE_SHORT = `@container ${LESSON_CONTAINER} (min-aspect-ratio: 5/4) and (max-height: 34rem)`;
export const LESSON_WIDE_LOW = `@container ${LESSON_CONTAINER} (min-aspect-ratio: 5/4) and (max-height: 20rem)`;
export const LESSON_TALL = `@container ${LESSON_CONTAINER} (max-aspect-ratio: 5/4) and (min-height: 44rem)`;
export const LESSON_CRAMPED = `@container ${LESSON_CONTAINER} (max-width: 16rem) or (max-height: 16rem)`;
export const LESSON_NARROW = `@container ${LESSON_CONTAINER} (max-width: 21rem)`;
export const LESSON_PHONE = `@container ${LESSON_CONTAINER} (max-width: 26rem)`;
export const LESSON_PICTURE_ROOMY = `@container ${LESSON_PICTURE_CONTAINER} (max-aspect-ratio: 6/5)`;

export const LESSON_PAIRED = '[data-kk-lesson-paired="true"] > &';

const INSET_GAP = '0.5rem';
const INSET_WIDTH_SHARE = 34;
const INSET_HEIGHT_SHARE = 42;
const WIDE_INSET_WIDTH_SHARE = 36;
const WIDE_INSET_HEIGHT_SHARE = 48;
const VIDEO_HEIGHT = 'calc(100cqw * 9 / 16)';
const BESIDE_VIDEO_SHARE = 68;
export const BESIDE_VIDEO_WIDTH = `min(calc(100cqh * 16 / 9), ${BESIDE_VIDEO_SHARE}cqw)`;
const BESIDE_BAND_ROOM = '20rem';
export const BESIDE_PICTURE_HEIGHT = `min(calc(${BESIDE_VIDEO_SHARE}cqw * 9 / 16), calc(100cqh - ${BESIDE_BAND_ROOM}))`;

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

export const STACKED_VIDEO_BOX: CSSObject = {
  right: 0,
  bottom: `calc(100cqh - ${VIDEO_HEIGHT})`,
  width: '100cqw',
  height: VIDEO_HEIGHT,
};

export const STACKED_STAGE_BOX: CSSObject = {
  right: 0,
  bottom: 0,
  width: '100cqw',
  height: `calc(100cqh - ${VIDEO_HEIGHT})`,
};

export const HIDDEN_HEADING = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  m: '-1px',
  p: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;

export const BESIDE_VIDEO_BOX: CSSObject = {
  right: `calc(100cqw - ${BESIDE_VIDEO_WIDTH})`,
  bottom: 0,
  width: BESIDE_VIDEO_WIDTH,
  height: '100cqh',
};

export const BESIDE_STAGE_BOX: CSSObject = {
  right: 0,
  bottom: 0,
  width: `calc(100cqw - ${BESIDE_VIDEO_WIDTH})`,
  height: '100cqh',
};

export const LESSON_DOCKED = '[data-kk-lesson-docked="true"] > &';
const LESSON_PICTURE_UPRIGHT = `@container ${LESSON_PICTURE_CONTAINER} (max-aspect-ratio: 5/4)`;
const DOCK_SIDE_SHARE = 26;
const DOCK_BELOW_SHARE = 30;

const dockCornerOf = (aspect: number): CSSObject => ({
  right: INSET_GAP,
  bottom: INSET_GAP,
  width: `min(${DOCK_SIDE_SHARE}cqw, calc((100cqh - ${INSET_GAP} * 2) * ${aspect}))`,
  height: `calc(min(${DOCK_SIDE_SHARE}cqw, calc((100cqh - ${INSET_GAP} * 2) * ${aspect})) / ${aspect})`,
  [LESSON_PICTURE_UPRIGHT]: {
    width: `min(calc(${DOCK_BELOW_SHARE}cqh * ${aspect}), calc(100cqw - ${INSET_GAP} * 2))`,
    height: `calc(min(calc(${DOCK_BELOW_SHARE}cqh * ${aspect}), calc(100cqw - ${INSET_GAP} * 2)) / ${aspect})`,
  },
});

export const DOCKED_STAGE_ROOM: CSSObject = {
  padding: INSET_GAP,
};

export const dockedInsetOf = (aspect: number): CSSObject => ({
  [LESSON_DOCKED]: dockCornerOf(aspect),
});

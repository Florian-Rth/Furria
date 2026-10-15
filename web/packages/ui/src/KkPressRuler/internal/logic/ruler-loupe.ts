export type LoupeSide = 'above' | 'below';

import type { KkPressRulerMark } from '../../press-ruler-data';

export const loupeLeftOf = (fingerX: number, rulerWidth: number, loupeWidth: number): number =>
  Math.min(Math.max(fingerX - loupeWidth / 2, 0), Math.max(rulerWidth - loupeWidth, 0));

export interface LoupeWindow {
  from: number;
  to: number;
}

export const loupeWindowOf = (share: number, span: number): LoupeWindow => {
  const from = Math.min(Math.max(share - span, 0), 1 - span * 2);

  return { from, to: from + span * 2 };
};

export const marksInWindowOf = (
  marks: readonly KkPressRulerMark[],
  window: LoupeWindow,
): KkPressRulerMark[] =>
  marks
    .filter((mark) => mark.share >= window.from && mark.share <= window.to)
    .map((mark) => ({ ...mark, share: (mark.share - window.from) / (window.to - window.from) }));

export const shareInWindowOf = (share: number, window: LoupeWindow): number | null =>
  share < window.from || share > window.to
    ? null
    : (share - window.from) / (window.to - window.from);

export const loupeSideOf = (laneTop: number, ceiling: number, loupeHeight: number): LoupeSide =>
  laneTop - loupeHeight >= ceiling ? 'above' : 'below';

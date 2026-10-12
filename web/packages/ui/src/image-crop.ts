import type { KkAspect, KkSize } from './image-aspect';
import { aspectOf } from './image-aspect';

export interface KkCrop {
  left: number;
  top: number;
  width: number;
  height: number;
}

const WHOLE: KkCrop = { left: 0, top: 0, width: 1, height: 1 };

export const centredCrop = (image: KkSize | null, aspect: KkAspect): KkCrop => {
  if (image === null || image.width <= 0 || image.height <= 0) {
    return WHOLE;
  }
  const target = aspectOf(aspect);
  const ratio = image.width / image.height;
  if (ratio > target) {
    const share = target / ratio;
    return { left: (1 - share) / 2, top: 0, width: share, height: 1 };
  }
  const share = ratio / target;
  return { left: 0, top: (1 - share) / 2, width: 1, height: share };
};

const shareOf = (edge: number): number => Math.min(Math.max(edge, 0), 1);

export const cropInsidePicture = (crop: KkCrop): KkCrop => {
  const left = shareOf(crop.left);
  const top = shareOf(crop.top);

  return {
    left,
    top,
    width: Math.min(shareOf(crop.width), 1 - left),
    height: Math.min(shareOf(crop.height), 1 - top),
  };
};

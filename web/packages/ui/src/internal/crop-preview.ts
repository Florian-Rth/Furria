import type { KkCrop } from '../image-crop';

const PERCENT = 100;
const WHOLE_SHARE = 1;

const offsetOf = (edge: number, share: number): number =>
  share >= WHOLE_SHARE ? 0 : (edge / (WHOLE_SHARE - share)) * PERCENT;

export interface KkCropBackground {
  size: string;
  position: string;
}

export const cropBackgroundOf = (crop: KkCrop): KkCropBackground => ({
  size: `${PERCENT / crop.width}% ${PERCENT / crop.height}%`,
  position: `${offsetOf(crop.left, crop.width)}% ${offsetOf(crop.top, crop.height)}%`,
});

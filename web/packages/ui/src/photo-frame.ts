import { kkTokens } from './tokens';

export type KkPhotoOrientation = 'landscape' | 'portrait';

export interface KkPhotoFrame {
  aspectRatio: string;
  width: number;
  height: number;
}

const INTRINSIC_UNIT = 240;

export const resolvePhotoFrame = (orientation: KkPhotoOrientation): KkPhotoFrame => {
  const aspectRatio = kkTokens.aspectRatio[orientation];
  const [widthUnits, heightUnits] = aspectRatio.split('/');

  return {
    aspectRatio,
    width: Number(widthUnits) * INTRINSIC_UNIT,
    height: Number(heightUnits) * INTRINSIC_UNIT,
  };
};

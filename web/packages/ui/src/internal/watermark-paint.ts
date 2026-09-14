import { kkTokens } from '../tokens';
import type { KkScheme } from './scheme-paint';

export const watermarkOpacityScheme: KkScheme = {
  light: { opacity: kkTokens.opacity.watermark },
  dark: { opacity: kkTokens.opacity.watermarkDark },
};

export const bandWatermarkOpacityScheme: KkScheme = {
  light: { opacity: kkTokens.opacity.watermarkBand },
  dark: { opacity: kkTokens.opacity.watermarkBandDark },
};

import { kkTokens } from '../tokens';
import type { KkScheme } from './scheme-paint';

export const watermarkOpacityScheme: KkScheme = {
  light: { opacity: kkTokens.opacity.watermark },
  dark: { opacity: kkTokens.opacity.watermarkDark },
};

import { useTheme } from '@mui/material/styles';
import { typePixelsOf } from './internal/type-pixels';

export type KkMeasuredVariant = 'body1' | 'body2';

export type KkTextMeasure = (text: string, variant: KkMeasuredVariant) => number;

const FALLBACK_WEIGHT = 500;

export const useKkTextMeasure = (): KkTextMeasure => {
  const theme = useTheme();
  const context =
    typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');

  return (text, variant) => {
    if (context === null) {
      return 0;
    }
    const face = theme.typography[variant];
    context.font = `${face.fontWeight ?? FALLBACK_WEIGHT} ${typePixelsOf(face.fontSize)}px ${face.fontFamily ?? theme.typography.fontFamily}`;
    return context.measureText(text).width;
  };
};

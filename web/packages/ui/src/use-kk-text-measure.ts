import { useTheme } from '@mui/material/styles';

export type KkMeasuredVariant = 'body1' | 'body2';

export type KkTextMeasure = (text: string, variant: KkMeasuredVariant) => number;

const REM_PIXELS = 16;
const FALLBACK_WEIGHT = 500;

const pixelsOf = (size: string | number | undefined): number => {
  if (typeof size === 'number') {
    return size;
  }
  if (size === undefined) {
    return REM_PIXELS;
  }
  const value = Number.parseFloat(size);
  return size.endsWith('rem') ? value * REM_PIXELS : value;
};

export const useKkTextMeasure = (): KkTextMeasure => {
  const theme = useTheme();
  const context =
    typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');

  return (text, variant) => {
    if (context === null) {
      return 0;
    }
    const face = theme.typography[variant];
    context.font = `${face.fontWeight ?? FALLBACK_WEIGHT} ${pixelsOf(face.fontSize)}px ${face.fontFamily ?? theme.typography.fontFamily}`;
    return context.measureText(text).width;
  };
};

import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { typePixelsOf } from '../../../internal/type-pixels';

export type KkCalendarHoursMeter = (text: string, weight: number) => number;

const UNMEASURED = 0;

const canvasContext = (): CanvasRenderingContext2D | null =>
  typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');

export const useHoursLabelMeter = (): KkCalendarHoursMeter => {
  const theme = useTheme();
  const [context] = useState(canvasContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const pixels = typePixelsOf(theme.typography.caption.fontSize);
  const family = theme.typography.fontFamily;

  useEffect(() => {
    let live = true;

    void document.fonts.ready.then(() => {
      if (live) {
        setFontsLoaded(true);
      }
    });

    return () => {
      live = false;
    };
  }, []);

  return (text, weight) => {
    if (context === null || !fontsLoaded) {
      return UNMEASURED;
    }

    context.font = `${weight} ${pixels}px ${family}`;

    return context.measureText(text).width;
  };
};

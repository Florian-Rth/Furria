import { useState } from 'react';
import type { MeasureBounds } from '../hall-measure-text';
import { measureText, parseMeasure } from '../hall-measure-text';

export interface MeasureDraft {
  text: string;
  isInvalid: boolean;
  change: (text: string) => void;
}

export const useMeasureDraft = (
  value: number,
  bounds: MeasureBounds,
  onCommit: (value: number) => void,
): MeasureDraft => {
  const [text, setText] = useState(measureText(value));
  const [seen, setSeen] = useState(value);

  if (seen !== value) {
    setSeen(value);
    if (parseMeasure(text, bounds) !== Math.round(value)) {
      setText(measureText(value));
    }
  }

  return {
    text,
    isInvalid: parseMeasure(text, bounds) === null,
    change: (next) => {
      setText(next);
      const parsed = parseMeasure(next, bounds);
      if (parsed !== null) {
        onCommit(parsed);
      }
    },
  };
};

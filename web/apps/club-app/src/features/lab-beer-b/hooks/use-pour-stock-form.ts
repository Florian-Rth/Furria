import { useState } from 'react';
import type { LabBeerCorrectionReason } from '@/features/lab-beer/beer-lab-types';
import type { PourCorrectionDirection } from '../pour-hub';
import { correctionDeltaOf, countOfText } from '../pour-hub';

export interface PourStockForm {
  countText: string;
  setCountText: (text: string) => void;
  count: number;
  reason: LabBeerCorrectionReason;
  setReason: (reason: LabBeerCorrectionReason) => void;
  direction: PourCorrectionDirection;
  setDirection: (direction: PourCorrectionDirection) => void;
  delta: number;
}

export const usePourStockForm = (initialCount: string): PourStockForm => {
  const [countText, setCountText] = useState(initialCount);
  const [reason, setReason] = useState<LabBeerCorrectionReason>('shrinkage');
  const [direction, setDirection] = useState<PourCorrectionDirection>('less');
  const count = countOfText(countText);

  return {
    countText,
    setCountText,
    count,
    reason,
    setReason,
    direction,
    setDirection,
    delta: correctionDeltaOf(reason, direction, count),
  };
};

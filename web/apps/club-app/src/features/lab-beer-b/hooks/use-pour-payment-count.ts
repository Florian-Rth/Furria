import { useState } from 'react';
import type { LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import type { PourPaymentPreview } from '../pour-hub';
import { countOfText, paymentPreviewOf } from '../pour-hub';

export interface PourPaymentCount {
  text: string;
  setText: (text: string) => void;
  count: number;
  valid: boolean;
  preview: PourPaymentPreview;
  markedIds: ReadonlySet<number>;
}

export const usePourPaymentCount = (tab: LabBeerTab): PourPaymentCount => {
  const [text, setText] = useState(String(tab.openCount));
  const count = countOfText(text);
  const preview = paymentPreviewOf(tab, count);

  return {
    text,
    setText,
    count,
    valid: count >= 1 && count <= tab.openCount,
    preview,
    markedIds: new Set(preview.settles.map((entry) => entry.crate.id)),
  };
};

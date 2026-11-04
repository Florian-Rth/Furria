import { useState } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import type { LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import type { BeerASettlePlan } from '../beer-a-tab';
import { settlePlanOf } from '../beer-a-tab';

export interface BeerAPaymentDraft {
  countText: string;
  count: number;
  plan: BeerASettlePlan;
  refusal: LabBeerRefusal | null;
  changeCount: (text: string) => void;
  book: () => void;
}

export const usePaymentDraft = (
  tab: LabBeerTab,
  pay: (personId: number, count: number) => LabBeerRefusal | null,
): BeerAPaymentDraft => {
  const [countText, setCountText] = useState(String(tab.openCount));
  const [refusal, setRefusal] = useState<LabBeerRefusal | null>(null);
  const parsed = Number.parseInt(countText, 10);
  const count = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, tab.openCount));

  const book = (): void => {
    setRefusal(pay(tab.personId, count));
  };

  return {
    countText,
    count,
    plan: settlePlanOf(tab, count),
    refusal,
    changeCount: setCountText,
    book,
  };
};

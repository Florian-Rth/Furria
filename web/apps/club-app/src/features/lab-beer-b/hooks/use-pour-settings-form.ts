import { useState } from 'react';
import type { LabBeerPot } from '@/features/lab-beer/beer-lab-types';
import type { PourPotSettings } from '../pour-hub';
import { centsOfPriceText, priceTextOf, textOrNull } from '../pour-hub';

export interface PourSettingsForm {
  priceText: string;
  setPriceText: (text: string) => void;
  link: string;
  setLink: (text: string) => void;
  note: string;
  setNote: (text: string) => void;
  settings: PourPotSettings | null;
}

export const usePourSettingsForm = (pot: LabBeerPot): PourSettingsForm => {
  const [priceText, setPriceText] = useState(priceTextOf(pot.priceCents));
  const [link, setLink] = useState(pot.paymentLink ?? '');
  const [note, setNote] = useState(pot.paymentNote ?? '');
  const priceCents = centsOfPriceText(priceText);

  return {
    priceText,
    setPriceText,
    link,
    setLink,
    note,
    setNote,
    settings:
      priceCents === null
        ? null
        : { priceCents, paymentLink: textOrNull(link), paymentNote: textOrNull(note) },
  };
};

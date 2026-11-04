import { useState } from 'react';
import { centsOfPriceText, priceTextOf, textOrNull } from '../beer-hub';
import type { BeerPotSettings } from '../schemas';

export interface PotSettingsForm {
  priceText: string;
  setPriceText: (text: string) => void;
  link: string;
  setLink: (text: string) => void;
  note: string;
  setNote: (text: string) => void;
  priceInvalid: boolean;
  detailsMissing: boolean;
  settings: BeerPotSettings | null;
}

export const usePotSettingsForm = (initial: BeerPotSettings | null): PotSettingsForm => {
  const [priceText, setPriceText] = useState(
    initial === null ? '' : priceTextOf(initial.cratePriceCents),
  );
  const [link, setLink] = useState(initial?.paymentLink ?? '');
  const [note, setNote] = useState(initial?.paymentNote ?? '');
  const cratePriceCents = centsOfPriceText(priceText);
  const paymentLink = textOrNull(link);
  const paymentNote = textOrNull(note);
  const detailsMissing = paymentLink === null && paymentNote === null;

  return {
    priceText,
    setPriceText,
    link,
    setLink,
    note,
    setNote,
    priceInvalid: cratePriceCents === null,
    detailsMissing,
    settings:
      cratePriceCents === null || detailsMissing
        ? null
        : { cratePriceCents, paymentLink, paymentNote },
  };
};

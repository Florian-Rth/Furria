import { useState } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import type { LabBeerPot } from '@/features/lab-beer/beer-lab-types';
import type { BeerAPotDraft } from '../beer-a-access';
import { centsFromInput, inputFromCents } from '../beer-a-access';

const LAB_BOOKING_PATH = '/lab-beer-book-a';

export interface BeerAPotSettings {
  priceText: string;
  link: string;
  note: string;
  priceInvalid: boolean;
  saved: boolean;
  changePrice: (value: string) => void;
  changeLink: (value: string) => void;
  changeNote: (value: string) => void;
  save: () => void;
  print: () => void;
  bookingUrl: string;
}

export const usePotSettings = (
  pot: LabBeerPot,
  saveSettings: (draft: BeerAPotDraft) => LabBeerRefusal | null,
): BeerAPotSettings => {
  const [priceText, setPriceText] = useState(inputFromCents(pot.priceCents));
  const [link, setLink] = useState(pot.paymentLink ?? '');
  const [note, setNote] = useState(pot.paymentNote ?? '');
  const [saved, setSaved] = useState(false);
  const priceCents = centsFromInput(priceText);

  const edited =
    <T>(setter: (value: T) => void) =>
    (value: T): void => {
      setter(value);
      setSaved(false);
    };

  const save = (): void => {
    if (priceCents === null) {
      return;
    }

    setSaved(saveSettings({ priceCents, paymentLink: link, paymentNote: note }) === null);
  };

  const print = (): void => {
    window.print();
  };

  return {
    priceText,
    link,
    note,
    priceInvalid: priceCents === null,
    saved,
    changePrice: edited(setPriceText),
    changeLink: edited(setLink),
    changeNote: edited(setNote),
    save,
    print,
    bookingUrl: `${window.location.origin}${LAB_BOOKING_PATH}`,
  };
};

import { useState } from 'react';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import { priceInputOf, settingsOf, withPotSettings } from '../ledger-settings';

export interface HubSettings {
  price: string;
  link: string;
  note: string;
  priceInvalid: boolean;
  saved: boolean;
  bookingUrl: string;
  setPrice: (value: string) => void;
  setLink: (value: string) => void;
  setNote: (value: string) => void;
  save: () => void;
  print: () => void;
}

const BOOKING_PATH = '/lab-beer-book-c';

export const useHubSettings = (beer: LabBeerWorldState): HubSettings => {
  const { pot } = beer.world;
  const [price, setPriceState] = useState(priceInputOf(pot.priceCents));
  const [link, setLinkState] = useState(pot.paymentLink ?? '');
  const [note, setNoteState] = useState(pot.paymentNote ?? '');
  const [saved, setSaved] = useState(false);
  const [tried, setTried] = useState(false);
  const settings = settingsOf(price, link, note);

  const edited =
    (setter: (value: string) => void) =>
    (value: string): void => {
      setter(value);
      setSaved(false);
    };

  const save = (): void => {
    setTried(true);

    if (settings === null) {
      return;
    }

    beer.apply((current) => withPotSettings(current, settings));
    setSaved(true);
  };

  return {
    price,
    link,
    note,
    priceInvalid: tried && settings === null,
    saved,
    bookingUrl: `${window.location.origin}${BOOKING_PATH}`,
    setPrice: edited(setPriceState),
    setLink: edited(setLinkState),
    setNote: edited(setNoteState),
    save,
    print: () => {
      window.print();
    },
  };
};

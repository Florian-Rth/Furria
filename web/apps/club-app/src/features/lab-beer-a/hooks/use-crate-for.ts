import { useState } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';

export interface BeerACrateForBooked {
  personId: number;
  crateIds: readonly number[];
}

export interface BeerACrateFor {
  personText: string;
  count: number;
  booked: BeerACrateForBooked | null;
  refusal: LabBeerRefusal | null;
  choosePerson: (value: string) => void;
  chooseCount: (count: number) => void;
  book: () => void;
  undo: () => void;
}

export const useCrateFor = (
  bookFor: (personId: number, count: number) => readonly number[] | LabBeerRefusal,
  undoCrates: (crateIds: readonly number[]) => LabBeerRefusal | null,
): BeerACrateFor => {
  const [personText, setPersonText] = useState('');
  const [count, setCount] = useState(1);
  const [booked, setBooked] = useState<BeerACrateForBooked | null>(null);
  const [refusal, setRefusal] = useState<LabBeerRefusal | null>(null);

  const book = (): void => {
    const personId = Number(personText);

    if (personText === '' || Number.isNaN(personId)) {
      return;
    }

    const outcome = bookFor(personId, count);

    if (typeof outcome === 'string') {
      setRefusal(outcome);
      setBooked(null);

      return;
    }

    setRefusal(null);
    setBooked({ personId, crateIds: outcome });
  };

  const undo = (): void => {
    if (booked !== null) {
      setRefusal(undoCrates(booked.crateIds));
      setBooked(null);
    }
  };

  return {
    personText,
    count,
    booked,
    refusal,
    choosePerson: setPersonText,
    chooseCount: setCount,
    book,
    undo,
  };
};

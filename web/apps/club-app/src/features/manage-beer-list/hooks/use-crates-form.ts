import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerCratesForMutation } from '../api';
import { countOfText } from '../beer-hub';
import type { PersonPick } from './use-person-pick';
import { usePersonPick } from './use-person-pick';

const MAX_PER_BOOKING = 20;

export interface CratesForm {
  pick: PersonPick;
  person: PersonRef | null;
  countText: string;
  setCountText: (text: string) => void;
  count: number;
  maxCount: number;
  paid: boolean;
  setPaid: (paid: boolean) => void;
  canSubmit: boolean;
  submit: () => void;
}

export interface CratesFormSource {
  beerPotId: number;
  candidates: readonly PersonRef[];
  initialPersonId: number | null;
  stock: number;
  onDone: () => void;
}

export const useCratesForm = (source: CratesFormSource): CratesForm => {
  const pick = usePersonPick(
    source.initialPersonId,
    source.candidates.map((candidate) => candidate.personId),
  );
  const [countText, setCountText] = useState('1');
  const [paid, setPaid] = useState(false);
  const booking = useBeerCratesForMutation(source.beerPotId);
  const person =
    source.candidates.find((candidate) => candidate.personId === pick.personId) ?? null;
  const maxCount = Math.min(MAX_PER_BOOKING, source.stock);
  const count = countOfText(countText);
  const canSubmit = person !== null && count >= 1 && count <= maxCount && !booking.isPending;

  return {
    pick,
    person,
    countText,
    setCountText,
    count,
    maxCount,
    paid,
    setPaid,
    canSubmit,
    submit: () => {
      if (person !== null && canSubmit) {
        booking.mutate(
          { personId: person.personId, count, paid, name: person.firstName },
          { onSuccess: source.onDone },
        );
      }
    },
  };
};

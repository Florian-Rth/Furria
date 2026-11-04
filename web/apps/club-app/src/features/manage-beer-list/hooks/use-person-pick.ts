import { useState } from 'react';

export interface PersonPick {
  personId: number | null;
  value: string;
  choose: (value: string) => void;
}

export const usePersonPick = (initial: number | null, allowed: readonly number[]): PersonPick => {
  const [picked, setPicked] = useState<number | null>(null);
  const candidate = picked ?? initial;
  const personId = candidate !== null && allowed.includes(candidate) ? candidate : null;

  return {
    personId,
    value: personId === null ? '' : String(personId),
    choose: (value) => {
      setPicked(value === '' ? null : Number(value));
    },
  };
};

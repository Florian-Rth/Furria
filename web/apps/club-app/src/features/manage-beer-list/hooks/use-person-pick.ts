import { useState } from 'react';

export interface PersonPick {
  personId: number | null;
  value: string;
  choose: (value: string) => void;
}

export const usePersonPick = (initial: number | null, allowed: readonly number[]): PersonPick => {
  const [picked, setPicked] = useState<number | null>(initial);
  const personId = picked !== null && allowed.includes(picked) ? picked : null;

  return {
    personId,
    value: personId === null ? '' : String(personId),
    choose: (value) => {
      setPicked(value === '' ? null : Number(value));
    },
  };
};

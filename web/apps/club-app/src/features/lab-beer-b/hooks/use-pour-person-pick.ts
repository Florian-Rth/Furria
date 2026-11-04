import { useState } from 'react';

export interface PourPersonPick {
  personId: number | null;
  value: string;
  choose: (value: string) => void;
  count: number;
  setCount: (count: number) => void;
}

export const usePourPersonPick = (
  initial: number | null,
  allowed: readonly number[],
): PourPersonPick => {
  const [picked, setPicked] = useState<number | null>(initial);
  const [count, setCount] = useState(1);
  const personId = picked !== null && allowed.includes(picked) ? picked : null;

  return {
    personId,
    value: personId === null ? '' : String(personId),
    choose: (value) => {
      setPicked(value === '' ? null : Number(value));
    },
    count,
    setCount,
  };
};

import { useEffect, useState } from 'react';

export const useDebouncedValue = <TValue>(value: TValue, delayMs: number): TValue => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return settled;
};

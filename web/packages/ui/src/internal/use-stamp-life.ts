import { useEffect, useState } from 'react';

export type StampLife = 'shown' | 'leaving' | 'gone';

export interface StampLifecycle {
  life: StampLife;
  leave: () => void;
}

export const useStampLife = (holdMs: number): StampLifecycle => {
  const [life, setLife] = useState<StampLife>('shown');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLife('leaving');
    }, holdMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [holdMs]);

  const leave = (): void => {
    setLife((current) => (current === 'leaving' ? 'gone' : current));
  };

  return { life, leave };
};

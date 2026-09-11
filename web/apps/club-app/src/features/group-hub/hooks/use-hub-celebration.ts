import { useState } from 'react';

export interface HubCelebration {
  fireKey: number;
  celebrate: () => void;
}

export const useHubCelebration = (): HubCelebration => {
  const [fireKey, setFireKey] = useState(0);

  const celebrate = (): void => {
    setFireKey((current) => current + 1);
  };

  return { fireKey, celebrate };
};

import { useState } from 'react';

export const useGreetingFollows = (actKey: string | null): boolean => {
  const [openingKey, setOpeningKey] = useState<string | null>(null);

  if (actKey !== null && openingKey === null) {
    setOpeningKey(actKey);
  }

  return openingKey !== null && actKey !== null && openingKey !== actKey;
};

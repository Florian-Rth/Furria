import { useEffect, useState } from 'react';
import { hintVisitsOf, isHintedVisit, PRACTICE_HINT_VISITS_KEY } from '../practice-memory';

const readVisits = (): number => {
  try {
    return hintVisitsOf(window.localStorage.getItem(PRACTICE_HINT_VISITS_KEY));
  } catch {
    return 0;
  }
};

const writeVisits = (visits: number): void => {
  try {
    window.localStorage.setItem(PRACTICE_HINT_VISITS_KEY, String(visits));
  } catch {
    return;
  }
};

export const usePracticeHints = (fitting: boolean): boolean => {
  const [earlierVisits] = useState(readVisits);
  const hinted = fitting && isHintedVisit(earlierVisits);

  useEffect(() => {
    if (hinted) {
      writeVisits(earlierVisits + 1);
    }
  }, [hinted, earlierVisits]);

  return hinted;
};

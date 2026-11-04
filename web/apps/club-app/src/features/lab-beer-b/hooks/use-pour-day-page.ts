import { useState } from 'react';

export interface PourDayPage {
  limit: number;
  hidden: number;
  showOlder: () => void;
}

export const usePourDayPage = (total: number, page: number): PourDayPage => {
  const [limit, setLimit] = useState(page);

  return {
    limit,
    hidden: Math.max(0, total - limit),
    showOlder: () => {
      setLimit(limit + page);
    },
  };
};

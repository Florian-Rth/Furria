import { useState } from 'react';

export interface DayPage {
  limit: number;
  hidden: number;
  showOlder: () => void;
}

export const useDayPage = (total: number, page: number): DayPage => {
  const [limit, setLimit] = useState(page);

  return {
    limit,
    hidden: Math.max(0, total - limit),
    showOlder: () => {
      setLimit(limit + page);
    },
  };
};

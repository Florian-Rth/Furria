import { useEffect, useState } from 'react';

export const useBeatReached = (atMs: number): boolean => {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReached(true);
    }, atMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [atMs]);

  return reached;
};

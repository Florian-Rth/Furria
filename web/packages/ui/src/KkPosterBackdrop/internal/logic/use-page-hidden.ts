import { useEffect, useState } from 'react';

const isHidden = (): boolean => document.visibilityState === 'hidden';

export const usePageHidden = (): boolean => {
  const [hidden, setHidden] = useState(isHidden);

  useEffect(() => {
    const follow = (): void => {
      setHidden(isHidden());
    };

    document.addEventListener('visibilitychange', follow);

    return () => {
      document.removeEventListener('visibilitychange', follow);
    };
  }, []);

  return hidden;
};

import { useEffect, useEffectEvent, useState } from 'react';
import { refetchDelayOf } from '../start-refetch';

const isVisible = (): boolean => document.visibilityState === 'visible';

export const useReshapeRefetch = (reshapeAt: string | null, refetch: () => void): void => {
  const [visible, setVisible] = useState(isVisible);
  const reshape = useEffectEvent(() => {
    refetch();
  });

  useEffect(() => {
    const watch = (): void => {
      setVisible(isVisible());
    };

    document.addEventListener('visibilitychange', watch);

    return () => {
      document.removeEventListener('visibilitychange', watch);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const delay = refetchDelayOf(reshapeAt, new Date());

    if (delay === null) {
      return;
    }

    const timer = setTimeout(reshape, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [reshapeAt, visible]);
};

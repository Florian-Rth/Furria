import { useEffect } from 'react';

export const useGestureRelease = (active: boolean, endGesture: () => void): void => {
  useEffect(() => {
    if (!active) {
      return;
    }

    return () => {
      endGesture();
    };
  }, [active, endGesture]);
};

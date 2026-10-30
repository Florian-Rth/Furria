import type { KkWayPipCorner } from '@furria/ui/KkWayPip';
import { useState } from 'react';

export interface WayPip {
  corner: KkWayPipCorner;
  large: boolean;
  setCorner: (corner: KkWayPipCorner) => void;
  toggleLarge: () => void;
}

export const useWayPip = (): WayPip => {
  const [corner, setCorner] = useState<KkWayPipCorner>('topRight');
  const [large, setLarge] = useState(false);

  return {
    corner,
    large,
    setCorner,
    toggleLarge: () => {
      setLarge((shown) => !shown);
    },
  };
};

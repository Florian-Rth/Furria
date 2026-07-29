import type { RefObject } from 'react';
import { useState } from 'react';
import type { NavBurst } from './nav-burst';
import { resolveNavBurstOrigin } from './nav-burst';
import type { OriginRect } from './reveal-geometry';

interface NavBurstControls {
  navBurst: NavBurst | null;
  fireNavBurst: (chip: OriginRect) => void;
}

export const useNavBurst = (mastheadRef: RefObject<HTMLElement | null>): NavBurstControls => {
  const [navBurst, setNavBurst] = useState<NavBurst | null>(null);

  const fireNavBurst = (chip: OriginRect): void => {
    const masthead = mastheadRef.current?.getBoundingClientRect();
    if (!masthead) {
      return;
    }

    setNavBurst((current) => ({
      fireKey: (current?.fireKey ?? 0) + 1,
      ...resolveNavBurstOrigin(chip, masthead),
    }));
  };

  return { navBurst, fireNavBurst };
};

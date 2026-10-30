import { useState } from 'react';

export interface ReadinessReveal {
  shown: boolean;
  pinned: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

export const useReadinessReveal = (): ReadinessReveal => {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  return {
    shown: pinned || hovered,
    pinned,
    toggle: () => {
      setPinned((current) => !current);
    },
    show: () => {
      setHovered(true);
    },
    hide: () => {
      setHovered(false);
    },
  };
};

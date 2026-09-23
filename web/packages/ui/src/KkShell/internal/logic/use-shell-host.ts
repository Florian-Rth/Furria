import { useState } from 'react';

export interface KkShellHost {
  node: HTMLElement | null;
  hold: (node: HTMLElement | null) => void;
}

export const useShellHost = (): KkShellHost => {
  const [node, setNode] = useState<HTMLElement | null>(null);

  return { node, hold: setNode };
};

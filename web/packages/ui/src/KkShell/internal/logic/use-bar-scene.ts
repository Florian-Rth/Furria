import { useEffect, useState } from 'react';
import type { KkScreenMove } from '../../screen-move';
import type { KkBarScene, KkBarSnapshot } from './bar-scene';
import { useKkShell } from './shell-context';

interface BarRecall {
  path: string;
  previous: KkBarSnapshot | null;
  move: KkScreenMove;
}

export const useBarScene = (current: KkBarSnapshot): KkBarScene => {
  const { barMemory, move } = useKkShell();
  const [recall, setRecall] = useState<BarRecall>(() => ({
    path: current.path,
    previous: barMemory.last,
    move,
  }));

  if (recall.path !== current.path) {
    setRecall({ path: current.path, previous: barMemory.last, move });
  }

  useEffect(() => {
    barMemory.last = current;
  });

  return { previous: recall.previous, current, move: recall.move };
};

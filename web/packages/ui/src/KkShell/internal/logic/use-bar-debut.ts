import { useEffect, useState } from 'react';
import type { KkBarScene } from './bar-scene';
import { useKkShell } from './shell-context';

export const useBarDebut = (scene: KkBarScene): boolean => {
  const { barMemory } = useKkShell();
  const [debut] = useState(
    () => scene.previous !== null && scene.previous !== barMemory.playedFrom,
  );

  useEffect(() => {
    barMemory.playedFrom = scene.previous;
  }, [barMemory, scene.previous]);

  return debut;
};

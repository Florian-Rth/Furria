import { useEffect, useState } from 'react';
import type { KkBarMorphScene } from './bar-morph';
import { useKkShell } from './internal/logic/shell-context';

export const useBarMorphDebut = (scene: KkBarMorphScene): boolean => {
  const { barMemory } = useKkShell();
  const [debut] = useState(
    () => scene.previous !== null && scene.previous !== barMemory.playedFrom,
  );

  useEffect(() => {
    barMemory.playedFrom = scene.previous;
  }, [barMemory, scene.previous]);

  return debut;
};

import { useLayoutEffect } from 'react';
import type { KkScreenStance } from './screen-stance';
import { useKkShell } from './shell-context';

export const useScreenStance = (stance: KkScreenStance): void => {
  const { holdStance } = useKkShell();
  const { kind, section, headClearance, footClearance, indexClearance } = stance;

  useLayoutEffect(() => {
    holdStance({ kind, section, headClearance, footClearance, indexClearance });
  }, [holdStance, kind, section, headClearance, footClearance, indexClearance]);

  useLayoutEffect(
    () => () => {
      holdStance(null);
    },
    [holdStance],
  );
};

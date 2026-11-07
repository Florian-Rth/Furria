import { useLayoutEffect } from 'react';
import { useKkShell } from './internal/logic/shell-context';

export const useKkBarFold = (): void => {
  const { holdBarFold } = useKkShell();

  useLayoutEffect(() => {
    holdBarFold(true);

    return () => {
      holdBarFold(false);
    };
  }, [holdBarFold]);
};

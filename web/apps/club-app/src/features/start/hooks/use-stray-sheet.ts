import { useKkSheet } from '@furria/ui';
import { useEffect, useEffectEvent } from 'react';
import type { Start } from '../schemas';
import { isStrayStartSheet } from '../start-sheets';

export const useStraySheet = (start: Start | null): void => {
  const { openSheetId, close } = useKkSheet();
  const stray = start !== null && isStrayStartSheet(openSheetId, start);

  const dropSheet = useEffectEvent((): void => {
    close();
  });

  useEffect(() => {
    if (stray) {
      dropSheet();
    }
  }, [stray]);
};

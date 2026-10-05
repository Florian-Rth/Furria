import { useKkSheet } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useEffectEvent } from 'react';
import type { Start } from '../schemas';
import { isStrayStartSheet } from '../start-sheets';

export const useStraySheet = (start: Start | null): void => {
  const { openSheetId } = useKkSheet();
  const navigate = useNavigate();
  const stray = start !== null && isStrayStartSheet(openSheetId, start);

  const dropSheet = useEffectEvent((): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, sheet: undefined }),
      replace: true,
      resetScroll: false,
    });
  });

  useEffect(() => {
    if (stray) {
      dropSheet();
    }
  }, [stray]);
};

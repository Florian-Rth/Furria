import { useNavigate, useRouter } from '@tanstack/react-router';
import { stepOffLayer } from '@/lib/back-stack';
import { appRouteApi } from '../app-route';

export interface SheetManager {
  openSheetId: string | null;
  onOpen: (sheetId: string) => void;
  onClose: () => void;
}

export const useSheetManager = (): SheetManager => {
  const { sheet } = appRouteApi.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const sheetIsOpen = sheet !== undefined;

  const go = (next: string | undefined, replace: boolean): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, sheet: next }),
      replace,
      resetScroll: false,
    });
  };

  return {
    openSheetId: sheet ?? null,
    onOpen: (sheetId) => {
      go(sheetId, sheetIsOpen);
    },
    onClose: () => {
      if (!sheetIsOpen || stepOffLayer(router.history)) {
        return;
      }

      go(undefined, true);
    },
  };
};

import { useNavigate } from '@tanstack/react-router';
import { appRouteApi } from '../app-route';

export interface SheetManager {
  openSheetId: string | null;
  onOpen: (sheetId: string) => void;
  onClose: () => void;
}

export const useSheetManager = (): SheetManager => {
  const { sheet } = appRouteApi.useSearch();
  const navigate = useNavigate();

  const go = (next: string | undefined): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, sheet: next }),
      resetScroll: false,
    });
  };

  return {
    openSheetId: sheet ?? null,
    onOpen: (sheetId) => {
      go(sheetId);
    },
    onClose: () => {
      go(undefined);
    },
  };
};

import { appRouteApi } from '../app-route';

export interface SheetManager {
  openSheetId: string | null;
  onOpen: (sheetId: string) => void;
  onClose: () => void;
}

export const useSheetManager = (): SheetManager => {
  const { sheet } = appRouteApi.useSearch();
  const navigate = appRouteApi.useNavigate();

  const go = (next: string | undefined): void => {
    void navigate({ to: '.', search: (previous) => ({ ...previous, sheet: next }) });
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

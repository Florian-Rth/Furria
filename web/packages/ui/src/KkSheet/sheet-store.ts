import { createContext, useContext } from 'react';

export interface KkSheetManager {
  openSheetId: string | null;
  open: (sheetId: string) => void;
  close: () => void;
}

export const KkSheetContext = createContext<KkSheetManager | null>(null);

export const useKkSheet = (): KkSheetManager => {
  const manager = useContext(KkSheetContext);

  if (manager === null) {
    throw new Error('useKkSheet must be used inside KkSheetProvider.');
  }

  return manager;
};

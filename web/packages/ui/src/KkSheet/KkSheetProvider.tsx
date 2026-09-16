import type { FC, PropsWithChildren } from 'react';
import { KkSheetContext } from './sheet-store';

interface KkSheetProviderProps extends PropsWithChildren {
  openSheetId: string | null;
  onOpen: (sheetId: string) => void;
  onClose: () => void;
}

export const KkSheetProvider: FC<KkSheetProviderProps> = ({
  openSheetId,
  onOpen,
  onClose,
  children,
}) => (
  <KkSheetContext.Provider value={{ openSheetId, open: onOpen, close: onClose }}>
    {children}
  </KkSheetContext.Provider>
);

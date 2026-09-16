import type { FC, PropsWithChildren } from 'react';
import { KkSheetCommandsContext, KkSheetOpenContext } from './sheet-store';

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
  <KkSheetCommandsContext.Provider value={{ open: onOpen, close: onClose }}>
    <KkSheetOpenContext.Provider value={openSheetId}>{children}</KkSheetOpenContext.Provider>
  </KkSheetCommandsContext.Provider>
);

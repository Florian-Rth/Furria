import { createContext, useContext } from 'react';

export interface KkSheetCommands {
  open: (sheetId: string) => void;
  close: () => void;
}

export interface KkSheetManager extends KkSheetCommands {
  openSheetId: string | null;
}

export const KkSheetOpenContext = createContext<string | null | undefined>(undefined);
export const KkSheetCommandsContext = createContext<KkSheetCommands | null>(null);

export const useKkSheetCommands = (): KkSheetCommands => {
  const commands = useContext(KkSheetCommandsContext);

  if (commands === null) {
    throw new Error('useKkSheetCommands must be used inside KkSheetProvider.');
  }

  return commands;
};

export const useKkSheet = (): KkSheetManager => {
  const openSheetId = useContext(KkSheetOpenContext);
  const commands = useKkSheetCommands();

  if (openSheetId === undefined) {
    throw new Error('useKkSheet must be used inside KkSheetProvider.');
  }

  return { openSheetId, ...commands };
};

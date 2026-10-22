import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { PEEK_SHEET_ID } from '../../proof-copy';

export const useProofSheet = (): (() => void) => {
  const sheets = useKkSheetCommands();

  return () => {
    sheets.open(PEEK_SHEET_ID);
  };
};

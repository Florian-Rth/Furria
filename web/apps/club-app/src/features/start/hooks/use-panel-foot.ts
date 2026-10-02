import { useKkSheetCommands } from '@furria/ui';
import { toFootLabel } from '../start-lines';

export interface PanelFoot {
  label: string;
  open: () => void;
}

export const usePanelFoot = (sheetId: string, hidden: number): PanelFoot | null => {
  const sheet = useKkSheetCommands();

  if (hidden <= 0) {
    return null;
  }

  return {
    label: toFootLabel(hidden),
    open: () => {
      sheet.open(sheetId);
    },
  };
};

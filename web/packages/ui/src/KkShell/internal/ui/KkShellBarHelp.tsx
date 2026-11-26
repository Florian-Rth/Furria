import type { FC } from 'react';
import { HELP_SHEET_ID } from '../../../KkHelp/help-sheet-id';
import { KkIconButton } from '../../../KkIconButton';
import { useKkSheetCommands } from '../../../KkSheet/sheet-store';
import type { KkSx } from '../../../kk-sx';
import { barSlot } from '../logic/bar-slot';

const helpPaint: KkSx = [barSlot, { color: 'text.secondary' }];

interface KkShellBarHelpProps {
  label: string;
}

export const KkShellBarHelp: FC<KkShellBarHelpProps> = ({ label }) => {
  const sheets = useKkSheetCommands();

  const openHelp = (): void => {
    sheets.open(HELP_SHEET_ID);
  };

  return <KkIconButton label={label} icon="help" onClick={openHelp} sx={helpPaint} />;
};

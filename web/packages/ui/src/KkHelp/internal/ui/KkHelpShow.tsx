import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import { KkIcon } from '../../../KkIcon';
import { useKkSheetCommands } from '../../../KkSheet/sheet-store';
import { HELP_TEXT_INSET } from '../logic/help-counter';
import { revealSpotAfterSheet } from '../logic/help-spot';

interface KkHelpShowProps {
  spot: string;
  label: string;
}

export const KkHelpShow: FC<KkHelpShowProps> = ({ spot, label }) => {
  const sheets = useKkSheetCommands();

  const show = (): void => {
    sheets.close();
    revealSpotAfterSheet(spot);
  };

  return (
    <KkButton
      size="small"
      variant="text"
      startIcon={<KkIcon name="pointer" size="small" />}
      onClick={show}
      sx={{ alignSelf: 'flex-start', ml: HELP_TEXT_INSET }}
    >
      {label}
    </KkButton>
  );
};

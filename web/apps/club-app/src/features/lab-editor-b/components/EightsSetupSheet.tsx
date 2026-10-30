import { KkSheet } from '@furria/ui/KkSheet';
import { useKkSheet } from '@furria/ui/sheet-store';
import type { FC } from 'react';
import { EIGHTS_SETUP, EIGHTS_SETUP_CLOSE } from '../eights-copy';
import { SETUP_SHEET_ID } from '../eights-sheets';
import type { EightsMusicTab } from '../hooks/use-eights-routes';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsSetupView } from './EightsSetupView';

interface EightsSetupSheetProps {
  eights: EightsStudio;
  openMusic: (tab: EightsMusicTab) => void;
}

export const EightsSetupSheet: FC<EightsSetupSheetProps> = ({ eights, openMusic }) => {
  const sheet = useKkSheet();

  return (
    <KkSheet id={SETUP_SHEET_ID} title={EIGHTS_SETUP} closeLabel={EIGHTS_SETUP_CLOSE}>
      <KkSheet.Body>
        <EightsSetupView eights={eights} openMusic={openMusic} close={sheet.close} />
      </KkSheet.Body>
    </KkSheet>
  );
};

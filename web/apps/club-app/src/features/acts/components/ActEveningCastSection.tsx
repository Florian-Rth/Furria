import { KkCastGrid } from '@furria/ui/KkCastGrid';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { EVENING_ADD_LABEL, EVENING_CAST_LABEL, EVENING_CAST_TITLE } from '../act-evenings-copy';
import type { ActEveningPaneState } from '../hooks/use-act-evening-pane';
import { ActEveningStandInPicker } from './ActEveningStandInPicker';

interface ActEveningCastSectionProps {
  pane: ActEveningPaneState;
}

export const ActEveningCastSection: FC<ActEveningCastSectionProps> = ({ pane }) => {
  const picker = pane.isAdding ? <ActEveningStandInPicker pane={pane} /> : null;

  return (
    <KkPanelSection title={EVENING_CAST_TITLE}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkCastGrid
          label={EVENING_CAST_LABEL}
          tiles={pane.tiles}
          addLabel={EVENING_ADD_LABEL}
          onToggle={pane.toggle}
          onAdd={pane.openAdding}
        />
        {picker}
      </Stack>
    </KkPanelSection>
  );
};

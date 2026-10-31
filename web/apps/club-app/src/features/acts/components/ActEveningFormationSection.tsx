import { KkButton } from '@furria/ui/KkButton';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { EVENING_FORMATION_EDIT, EVENING_FORMATION_TITLE } from '../act-evenings-copy';
import type { ActEveningPaneState } from '../hooks/use-act-evening-pane';

interface ActEveningFormationSectionProps {
  pane: ActEveningPaneState;
}

export const ActEveningFormationSection: FC<ActEveningFormationSectionProps> = ({ pane }) => {
  const reset = pane.hasCopy ? (
    <KkButton
      size="small"
      variant="outlined"
      tone="danger"
      disabled={pane.busy}
      onClick={pane.reset}
    >
      {pane.resetText}
    </KkButton>
  ) : null;

  return (
    <KkPanelSection title={EVENING_FORMATION_TITLE}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkNote>{pane.formationLine}</KkNote>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <KkButton size="small" variant="outlined" onClick={pane.editFormation}>
            {EVENING_FORMATION_EDIT}
          </KkButton>
          {reset}
        </Stack>
      </Stack>
    </KkPanelSection>
  );
};

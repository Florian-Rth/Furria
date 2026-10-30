import { KkButton } from '@furria/ui/KkButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import { EVENING_ADD_DONE } from '../act-evenings-copy';
import type { ActEveningPaneState } from '../hooks/use-act-evening-pane';

interface ActEveningStandInPickerProps {
  pane: ActEveningPaneState;
}

const keepSearching = (): void => undefined;

export const ActEveningStandInPicker: FC<ActEveningStandInPickerProps> = ({ pane }) => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <PersonPicker selected={null} onSelect={pane.addPerson} onClear={keepSearching} />
    <KkButton size="small" variant="text" onClick={pane.closeAdding}>
      {EVENING_ADD_DONE}
    </KkButton>
  </Stack>
);

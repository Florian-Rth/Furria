import { KkButton } from '@furria/ui/KkButton';
import { KkCastGrid } from '@furria/ui/KkCastGrid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import type { SeasonCPaneEvening } from '../hooks/use-season-c-pane';
import { CAST_ADD, CAST_ADD_DONE, CAST_LABEL } from '../season-c-copy';

interface SeasonCPaneCastProps {
  evening: SeasonCPaneEvening;
}

const keepSearching = (): void => undefined;

export const SeasonCPaneCast: FC<SeasonCPaneCastProps> = ({ evening }) => {
  const picker = evening.adding ? (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <PersonPicker selected={null} onSelect={evening.addPerson} onClear={keepSearching} />
      <KkButton size="small" variant="text" onClick={evening.closeAdding}>
        {CAST_ADD_DONE}
      </KkButton>
    </Stack>
  ) : null;

  return (
    <Stack sx={{ gap: 1, minWidth: 0, pl: 1 }}>
      <KkCastGrid
        label={CAST_LABEL}
        tiles={evening.tiles}
        addLabel={CAST_ADD}
        onToggle={evening.togglePerson}
        onAdd={evening.openAdding}
      />
      {picker}
    </Stack>
  );
};

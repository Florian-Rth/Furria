import { KkButton } from '@furria/ui/KkButton';
import { KkCastGrid } from '@furria/ui/KkCastGrid';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import type { SeasonDetails } from '../hooks/use-season-details';
import {
  CAST_ADD,
  CAST_ADD_DONE,
  CAST_LABEL,
  CAST_NOT_ON_EVENING,
  CAST_TITLE,
} from '../season-a-copy';

interface SeasonCastBlockProps {
  details: SeasonDetails;
}

const keepSearching = (): void => undefined;

export const SeasonCastBlock: FC<SeasonCastBlockProps> = ({ details }) => {
  const picker = details.adding ? (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <PersonPicker selected={null} onSelect={details.addPerson} onClear={keepSearching} />
      <KkButton size="small" variant="text" onClick={details.closeAdding}>
        {CAST_ADD_DONE}
      </KkButton>
    </Stack>
  ) : null;
  const body = details.onEvening ? (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkCastGrid
        label={CAST_LABEL}
        tiles={details.tiles}
        addLabel={CAST_ADD}
        onToggle={details.toggleDancer}
        onAdd={details.openAdding}
      />
      {picker}
    </Stack>
  ) : (
    <KkNote>{CAST_NOT_ON_EVENING}</KkNote>
  );

  return (
    <KkPanelSection title={CAST_TITLE} meta={details.castSummary}>
      {body}
    </KkPanelSection>
  );
};

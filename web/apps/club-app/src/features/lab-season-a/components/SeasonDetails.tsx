import { KkButton } from '@furria/ui/KkButton';
import { KkChip } from '@furria/ui/KkChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonAct, SeasonEvening } from '@/features/season/schemas';
import type { SeasonPick } from '../hooks/use-season-a';
import { useSeasonDetails } from '../hooks/use-season-details';
import { ADD_TO_EVENING, REMOVE_FROM_EVENING } from '../season-a-copy';
import { SeasonCastBlock } from './SeasonCastBlock';
import { SeasonReadinessList } from './SeasonReadinessList';

interface SeasonDetailsProps {
  pick: SeasonPick;
  onToggle: (act: SeasonAct, evening: SeasonEvening) => void;
}

export const SeasonDetails: FC<SeasonDetailsProps> = ({ pick, onToggle }) => {
  const details = useSeasonDetails(pick);
  const toggleText = details.onEvening ? REMOVE_FROM_EVENING : ADD_TO_EVENING;
  const toggleVariant = details.onEvening ? 'outlined' : 'contained';
  const stateTone = details.cell.adjusted ? 'gold' : 'neutral';
  const toggle = (): void => {
    onToggle(pick.act, pick.evening);
  };

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}
      >
        <KkChip tone={stateTone}>{details.stateText}</KkChip>
        <KkButton size="small" variant={toggleVariant} onClick={toggle}>
          {toggleText}
        </KkButton>
      </Stack>
      <SeasonCastBlock details={details} />
      <SeasonReadinessList details={details} />
    </Stack>
  );
};

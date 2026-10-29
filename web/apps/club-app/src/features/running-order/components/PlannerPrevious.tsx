import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { PlannerPreviousChip } from './PlannerPreviousChip';

export const PlannerPrevious: FC = () => {
  const planner = usePlanner();

  if (planner.previous.length === 0) {
    return null;
  }

  const chips = planner.previous.map((evening) => (
    <PlannerPreviousChip key={evening.eventId} evening={evening} />
  ));

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, minWidth: 0 }}>
      {chips}
    </Stack>
  );
};

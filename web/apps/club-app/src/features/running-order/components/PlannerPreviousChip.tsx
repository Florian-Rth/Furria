import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import type { FC } from 'react';
import type { PreviousEvening } from '../planner-catalogue';
import { usePlanner } from '../planner-context';
import { toPreviousLabel } from '../planner-copy';

interface PlannerPreviousChipProps {
  evening: PreviousEvening;
}

export const PlannerPreviousChip: FC<PlannerPreviousChipProps> = ({ evening }) => {
  const planner = usePlanner();
  const take = (): void => {
    planner.pickMany(evening.actIds);
  };

  return (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="copy" size="small" />}
      disabled={evening.missing === 0}
      onClick={take}
    >
      {toPreviousLabel(evening.title, evening.missing)}
    </KkButton>
  );
};

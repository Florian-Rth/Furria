import { KkChip } from '@furria/ui/KkChip';
import type { FC } from 'react';
import { STATE_CHIPS } from '../intake-labels';
import type { IntakeState } from '../schemas';

interface IntakeStateChipProps {
  state: IntakeState;
  size?: 'small';
}

export const IntakeStateChip: FC<IntakeStateChipProps> = ({ state, size }) => {
  const chip = STATE_CHIPS[state];

  return (
    <KkChip tone={chip.tone} dot={chip.dot} size={size}>
      {chip.label}
    </KkChip>
  );
};

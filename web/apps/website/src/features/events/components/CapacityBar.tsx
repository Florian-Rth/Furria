import { kkTokens } from '@furria/ui';
import LinearProgress from '@mui/material/LinearProgress';
import type { FC } from 'react';
import type { CapacityBarColor } from '../sales-status-display';

interface CapacityBarProps {
  freeCount: number;
  capacity: number;
  color: CapacityBarColor;
}

export const CapacityBar: FC<CapacityBarProps> = ({ freeCount, capacity, color }) => {
  const occupiedPercent = Math.round(((capacity - freeCount) / capacity) * 100);

  return (
    <LinearProgress
      variant="determinate"
      value={occupiedPercent}
      color={color}
      aria-label="Vergebene Plätze"
      sx={{ width: '100%', height: '0.375rem', borderRadius: `${kkTokens.radius.pill}px` }}
    />
  );
};

import { KkAlert } from '@furria/ui/KkAlert';
import type { FC } from 'react';

interface BeerRejectionProps {
  rejection: string | null;
}

export const BeerRejection: FC<BeerRejectionProps> = ({ rejection }) => {
  if (rejection === null) {
    return null;
  }

  return <KkAlert severity="error">{rejection}</KkAlert>;
};

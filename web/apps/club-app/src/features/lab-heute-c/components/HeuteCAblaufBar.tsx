import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import type { HeuteCState } from '../hooks/use-heute-c';

interface HeuteCAblaufBarProps {
  heute: HeuteCState;
}

export const HeuteCAblaufBar: FC<HeuteCAblaufBarProps> = ({ heute }) => (
  <KkButton variant="outlined" fullWidth onClick={heute.openAblauf}>
    {heute.ablaufOpenText}
  </KkButton>
);

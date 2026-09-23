import type { FC } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkHandoverSwapProps } from '../../handover-stage';
import { KkShellBarSwap } from '../../internal/ui/KkShellBarSwap';
import { TuschStampSwap } from './TuschStampSwap';

export const TuschSwap: FC<KkHandoverSwapProps> = ({ rest, title, titleText }) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <KkShellBarSwap rest={rest} title={title} />;
  }

  return <TuschStampSwap rest={rest} titleText={titleText} />;
};

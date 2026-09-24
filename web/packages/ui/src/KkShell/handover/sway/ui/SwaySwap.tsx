import type { FC } from 'react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import type { KkHandoverSwapProps } from '../../../handover-stage';
import { KkShellBarSwap } from '../../../internal/ui/KkShellBarSwap';
import { SwayDanceSwap } from './SwayDanceSwap';

export const SwaySwap: FC<KkHandoverSwapProps> = ({ rest, title, restText, titleText }) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <KkShellBarSwap rest={rest} title={title} />;
  }

  return <SwayDanceSwap rest={rest} title={title} restText={restText} titleText={titleText} />;
};

import type { FC } from 'react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import type { KkHandoverSwapProps } from '../../../handover-stage';
import { KkShellBarSwap } from '../../../internal/ui/KkShellBarSwap';
import { SchunkelnDanceSwap } from './SchunkelnDanceSwap';

export const SchunkelnSwap: FC<KkHandoverSwapProps> = ({ rest, title, restText, titleText }) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <KkShellBarSwap rest={rest} title={title} />;
  }

  return <SchunkelnDanceSwap rest={rest} title={title} restText={restText} titleText={titleText} />;
};

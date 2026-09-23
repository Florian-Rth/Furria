import type { FC } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkHandoverSwapProps } from '../../handover-stage';
import { KonfettiDockFlightSwap } from './KonfettiDockFlightSwap';
import { KonfettiDockPlainSwap } from './KonfettiDockPlainSwap';

export const KonfettiDockSwap: FC<KkHandoverSwapProps> = ({ rest, title, titleText }) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <KonfettiDockPlainSwap rest={rest} title={title} />;
  }

  return <KonfettiDockFlightSwap rest={rest} titleText={titleText} />;
};

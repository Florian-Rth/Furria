import type { KkHandoverStage } from '../../handover-stage';
import { KonfettiDockHeader } from './KonfettiDockHeader';
import { KonfettiDockSwap } from './KonfettiDockSwap';

export const konfettiDockStage: KkHandoverStage = {
  Swap: KonfettiDockSwap,
  Header: KonfettiDockHeader,
};

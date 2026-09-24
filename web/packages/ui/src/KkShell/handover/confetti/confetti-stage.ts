import type { KkHandoverStage } from '../../handover-stage';
import { ConfettiHeader } from './ConfettiHeader';
import { ConfettiSwap } from './ConfettiSwap';

export const confettiStage: KkHandoverStage = {
  Swap: ConfettiSwap,
  Header: ConfettiHeader,
};

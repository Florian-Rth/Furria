import type { KkHandoverStage } from '../../handover-stage';
import { SwayHeader } from './ui/SwayHeader';
import { SwaySwap } from './ui/SwaySwap';

export const swayStage: KkHandoverStage = {
  Swap: SwaySwap,
  Header: SwayHeader,
};

import type { KkHandoverStage } from '../../handover-stage';
import { SplitFlapHeader } from './ui/SplitFlapHeader';
import { SplitFlapSwap } from './ui/SplitFlapSwap';

export const splitFlapStage: KkHandoverStage = {
  Swap: SplitFlapSwap,
  Header: SplitFlapHeader,
};

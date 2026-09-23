import type { KkHandoverStage } from '../../handover-stage';
import { TuschHeader } from './TuschHeader';
import { TuschSwap } from './TuschSwap';

export const tuschStage: KkHandoverStage = {
  Swap: TuschSwap,
  Header: TuschHeader,
};

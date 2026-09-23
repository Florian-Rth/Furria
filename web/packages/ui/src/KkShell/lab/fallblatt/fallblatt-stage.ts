import type { KkHandoverStage } from '../../handover-stage';
import { FallblattHeader } from './ui/FallblattHeader';
import { FallblattSwap } from './ui/FallblattSwap';

export const fallblattStage: KkHandoverStage = {
  Swap: FallblattSwap,
  Header: FallblattHeader,
};

import type { KkHandoverStage } from '../../handover-stage';
import { SchunkelnHeader } from './ui/SchunkelnHeader';
import { SchunkelnSwap } from './ui/SchunkelnSwap';

export const schunkelnStage: KkHandoverStage = {
  Swap: SchunkelnSwap,
  Header: SchunkelnHeader,
};

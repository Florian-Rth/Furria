import type { KkHandoverStage } from '../../handover-stage';
import { FanfareHeader } from './FanfareHeader';
import { FanfareSwap } from './FanfareSwap';

export const fanfareStage: KkHandoverStage = {
  Swap: FanfareSwap,
  Header: FanfareHeader,
};

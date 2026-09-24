import type { KkHandoverName, KkHandoverStage } from '../handover-stage';
import { confettiStage } from './confetti/confetti-stage';
import { splitFlapStage } from './split-flap/split-flap-stage';
import { swayStage } from './sway/sway-stage';

export const HANDOVER_STAGES: Record<KkHandoverName, KkHandoverStage> = {
  splitFlap: splitFlapStage,
  confetti: confettiStage,
  sway: swayStage,
};

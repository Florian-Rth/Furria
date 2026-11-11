import type { KkPromoCut, KkPromoScenePhase, KkPromoWallName } from '@furria/ui/promo-stage-types';

export interface ReelSceneProps {
  phase: KkPromoScenePhase;
  cut: KkPromoCut;
  wallNames: readonly KkPromoWallName[];
  accessUrl: string;
  accessAddress: string;
  yearsLabel: string;
}

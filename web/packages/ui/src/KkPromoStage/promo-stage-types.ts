export type KkPromoCut = 'hard' | 'mask' | 'whip' | 'wipe' | 'match';

export type KkPromoScenePhase = 'waiting' | 'live' | 'leaving';

export interface KkPromoPoint {
  x: number;
  y: number;
}

export interface KkPromoArrival {
  key: number;
  names: readonly string[];
  more: string | null;
}

export type { KkPromoDeviceEntry } from './internal/layout/KkPromoStageDevice';
export type { KkPromoHeadlineSize } from './internal/ui/KkPromoStageHeadline';
export type { KkPromoQrAnchor, KkPromoQrPose } from './internal/ui/KkPromoStageQrCard';
export type { KkPromoArrivalLabels } from './internal/ui/PromoArrival';

export interface KkPromoWallName {
  key: number;
  name: string;
  fresh: boolean;
}

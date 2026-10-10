import type { FC } from 'react';
import { KkNewsProofLiveLanding } from './KkNewsProofLiveLanding';

const TILE_TOP = -0.75;

interface KkNewsProofLiveTickProps {
  label: string;
  liveKey: number;
  order: number;
  top?: number;
}

export const KkNewsProofLiveTick: FC<KkNewsProofLiveTickProps> = ({
  label,
  liveKey,
  order,
  top = TILE_TOP,
}) =>
  liveKey === 0 ? null : (
    <KkNewsProofLiveLanding key={liveKey} label={label} order={order} top={top} />
  );

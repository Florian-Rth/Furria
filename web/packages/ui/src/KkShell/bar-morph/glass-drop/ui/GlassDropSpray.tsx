import type { FC } from 'react';
import { burstDepthOf, sprayOf } from '../logic/glass-drop-paths';
import type { GlassDropDirection } from '../logic/glass-drop-plan';
import { GlassDropSprayDrop } from './GlassDropSprayDrop';

interface GlassDropSprayProps {
  direction: GlassDropDirection;
}

export const GlassDropSpray: FC<GlassDropSprayProps> = ({ direction }) => {
  const origin = burstDepthOf(direction);

  return sprayOf(direction).map((drop) => (
    <GlassDropSprayDrop key={`${drop.x}:${drop.y}`} drop={drop} origin={origin} />
  ));
};

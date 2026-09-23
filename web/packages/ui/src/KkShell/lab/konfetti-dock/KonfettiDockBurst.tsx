import type { FC } from 'react';
import type { DockChipCounts } from './dock-chips';
import { buildDockChips } from './dock-chips';
import type { DockGeometry } from './dock-flight';
import { KonfettiDockBurstLayer } from './KonfettiDockBurstLayer';

const CHIP_COUNTS: DockChipCounts = { behind: 7, front: 16 };
const CHIP_SEED = 11;

interface KonfettiDockBurstProps {
  geometry: DockGeometry | null;
  landingKey: number;
}

export const KonfettiDockBurst: FC<KonfettiDockBurstProps> = ({ geometry, landingKey }) => {
  if (geometry === null || landingKey === 0) {
    return null;
  }

  const chips = buildDockChips(CHIP_COUNTS, CHIP_SEED + (landingKey % 97));
  const { slot, titleWidth } = geometry;
  const left = slot.left;
  const top = slot.top + slot.height / 2;

  return (
    <>
      <KonfettiDockBurstLayer
        key={`behind-${landingKey}`}
        layer="behind"
        chips={chips}
        left={left}
        top={top}
        spread={titleWidth}
      />
      <KonfettiDockBurstLayer
        key={`front-${landingKey}`}
        layer="front"
        chips={chips}
        left={left}
        top={top}
        spread={titleWidth}
      />
    </>
  );
};

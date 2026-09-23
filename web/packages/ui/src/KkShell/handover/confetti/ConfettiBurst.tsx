import type { FC } from 'react';
import { ConfettiBurstLayer } from './ConfettiBurstLayer';
import type { DockChipCounts } from './dock-chips';
import { buildDockChips } from './dock-chips';
import type { DockGeometry } from './dock-flight';

const CHIP_COUNTS: DockChipCounts = { behind: 7, front: 16 };
const CHIP_SEED = 11;

interface ConfettiBurstProps {
  geometry: DockGeometry | null;
  landingKey: number;
}

export const ConfettiBurst: FC<ConfettiBurstProps> = ({ geometry, landingKey }) => {
  if (geometry === null || landingKey === 0) {
    return null;
  }

  const chips = buildDockChips(CHIP_COUNTS, CHIP_SEED + (landingKey % 97));
  const { slot, titleWidth } = geometry;
  const left = slot.left;
  const top = slot.top + slot.height / 2;

  return (
    <>
      <ConfettiBurstLayer
        key={`behind-${landingKey}`}
        layer="behind"
        chips={chips}
        left={left}
        top={top}
        spread={titleWidth}
      />
      <ConfettiBurstLayer
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

import { KkPageSketch } from '@furria/ui/KkPageSketch';
import type { KkSlotRowPosition } from '@furria/ui/KkSlotRow';
import { KkSlotRow } from '@furria/ui/KkSlotRow';
import type { FC } from 'react';
import type { SlotPositionRef } from '../types';
import type { BoardSlot } from '../website-board';
import { flagTextOf, slotFactsOf } from '../website-copy';
import { positionFrameOf, selectedIndexOf, slotFlagOf } from '../website-frames';
import { slotSketchOf } from '../website-sketches';

interface WebsiteSlotRowProps {
  page: string;
  slot: BoardSlot;
  selected: SlotPositionRef | null;
  onSelect: (at: SlotPositionRef) => void;
}

export const WebsiteSlotRow: FC<WebsiteSlotRowProps> = ({ page, slot, selected, onSelect }) => {
  const sketch = slotSketchOf(page, slot.key);
  const positions: KkSlotRowPosition[] = slot.positions.map(positionFrameOf);
  const facts = slotFactsOf(
    slot.positions.map((position) => position.aspect),
    slot.filled,
  );
  const flag = slotFlagOf(slot.flag, flagTextOf);
  const selectedIndex = selectedIndexOf(slot.positions, selected);
  const sketchView = <KkPageSketch device={sketch.device} blocks={sketch.blocks} />;
  const selectPosition = (index: number): void => {
    const position = slot.positions[index];
    if (position !== undefined) {
      onSelect({ slot: position.slot, position: position.position });
    }
  };

  return (
    <KkSlotRow
      sketch={sketchView}
      title={slot.title}
      facts={facts}
      description={slot.description}
      flag={flag}
      positions={positions}
      selectedPosition={selectedIndex}
      onSelectPosition={selectPosition}
    />
  );
};

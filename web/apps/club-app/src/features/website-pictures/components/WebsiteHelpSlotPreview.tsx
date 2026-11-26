import { KkPageSketch } from '@furria/ui/KkPageSketch';
import type { KkSlotRowPosition } from '@furria/ui/KkSlotRow';
import { KkSlotRow } from '@furria/ui/KkSlotRow';
import type { FC } from 'react';
import { slotSketchOf } from '../website-sketches';

const keep = (): void => {};

const SAMPLE_SKETCH = slotSketchOf('landing', 'landing.hero');

const SAMPLE_POSITIONS: readonly KkSlotRowPosition[] = [
  {
    id: 'help-landing-hero',
    label: 'Titelbild, quer 7:5, leer',
    aspect: 'landscape',
    edge: '1',
    state: 'ready',
    mark: { kind: 'none' },
    placeholder: true,
  },
];

export const WebsiteHelpSlotPreview: FC = () => {
  const sketch = <KkPageSketch device={SAMPLE_SKETCH.device} blocks={SAMPLE_SKETCH.blocks} />;

  return (
    <KkSlotRow
      sketch={sketch}
      title="Titelbild"
      facts="quer 7:5"
      description="Großes Foto rechts neben der Überschrift der Startseite."
      positions={SAMPLE_POSITIONS}
      selectedPosition={null}
      onSelectPosition={keep}
    />
  );
};

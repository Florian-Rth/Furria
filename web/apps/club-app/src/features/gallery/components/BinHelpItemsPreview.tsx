import { KkFrame } from '@furria/ui/KkFrame';
import { KkFrameGrid } from '@furria/ui/KkFrameGrid';
import type { FC } from 'react';

const keep = (): void => {};

const SAMPLE_FRAMES = [
  { key: 'help-1', label: 'Bild 1', days: '27 T', selected: true },
  { key: 'help-2', label: 'Bild 2', days: '27 T', selected: true },
  { key: 'help-3', label: 'Bild 3', days: '21 T', selected: false },
  { key: 'help-4', label: 'Bild 4', days: '14 T', selected: false },
] as const;

export const BinHelpItemsPreview: FC = () => {
  const frames = SAMPLE_FRAMES.map((frame) => (
    <KkFrame
      key={frame.key}
      label={frame.label}
      latentLabel={frame.days}
      number={frame.days}
      selected={frame.selected}
      onSelect={keep}
    />
  ));

  return <KkFrameGrid label="Beispiel">{frames}</KkFrameGrid>;
};

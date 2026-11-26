import { KkFrame } from '@furria/ui/KkFrame';
import { KkFrameGrid } from '@furria/ui/KkFrameGrid';
import type { FC } from 'react';

const keep = (): void => {};

const SAMPLE_FRAMES = [
  { key: 'help-1', label: 'Bild 1', clock: '20:14', selected: true },
  { key: 'help-2', label: 'Bild 2', clock: '20:15', selected: true },
  { key: 'help-3', label: 'Bild 3', clock: '20:15', selected: true },
  { key: 'help-4', label: 'Bild 4', clock: '20:17', selected: false },
  { key: 'help-5', label: 'Bild 5', clock: '20:18', selected: false },
  { key: 'help-6', label: 'Bild 6', clock: '20:21', selected: false },
] as const;

export const AlbumHelpSelectPreview: FC = () => {
  const frames = SAMPLE_FRAMES.map((frame) => (
    <KkFrame
      key={frame.key}
      label={frame.label}
      latentLabel={frame.clock}
      number={frame.clock}
      selected={frame.selected}
      onSelect={keep}
    />
  ));

  return <KkFrameGrid label="Beispiel">{frames}</KkFrameGrid>;
};

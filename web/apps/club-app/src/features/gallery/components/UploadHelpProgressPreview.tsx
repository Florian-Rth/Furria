import type { KkFrameState } from '@furria/ui/KkFrame';
import { KkFrame } from '@furria/ui/KkFrame';
import { KkFrameGrid } from '@furria/ui/KkFrameGrid';
import type { FC } from 'react';

const keep = (): void => {};

interface SampleTile {
  key: string;
  label: string;
  clock: string;
  state: KkFrameState;
  progress?: number;
}

const SAMPLE_TILES: readonly SampleTile[] = [
  { key: 'help-1', label: 'Bild 1', clock: '20:14', state: 'processing' },
  { key: 'help-2', label: 'Bild 2', clock: '20:15', state: 'uploading', progress: 0.7 },
  { key: 'help-3', label: 'Bild 3', clock: '20:15', state: 'uploading', progress: 0.3 },
  { key: 'help-4', label: 'Bild 4', clock: '20:17', state: 'queued' },
];

export const UploadHelpProgressPreview: FC = () => {
  const tiles = SAMPLE_TILES.map((tile) => (
    <KkFrame
      key={tile.key}
      label={tile.label}
      latentLabel={tile.clock}
      state={tile.state}
      progress={tile.progress}
      onSelect={keep}
    />
  ));

  return <KkFrameGrid label="Beispiel">{tiles}</KkFrameGrid>;
};

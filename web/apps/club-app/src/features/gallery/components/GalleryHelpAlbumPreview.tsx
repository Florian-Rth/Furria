import type { KkContactStripFrame } from '@furria/ui/KkContactStrip';
import { KkContactStrip } from '@furria/ui/KkContactStrip';
import type { FC } from 'react';

const keep = (): void => {};

const SAMPLE_FRAMES: readonly KkContactStripFrame[] = [
  { id: 'help-1', label: 'Prunksitzung, Bild 1', latentLabel: '19:42', edge: '19:42' },
  { id: 'help-2', label: 'Prunksitzung, Bild 2', latentLabel: '20:15', edge: '20:15' },
  { id: 'help-3', label: 'Prunksitzung, Bild 3', latentLabel: '21:03', edge: '21:03' },
  { id: 'help-4', label: 'Prunksitzung, Bild 4', latentLabel: '22:30', edge: '22:30' },
];

export const GalleryHelpAlbumPreview: FC = () => (
  <KkContactStrip
    title="Prunksitzung"
    titleLabel="Prunksitzung öffnen"
    meta="Sa., 08.11.2026 · 214 Fotos"
    trail="Neu"
    tone="gold"
    frames={SAMPLE_FRAMES}
    onOpen={keep}
  />
);

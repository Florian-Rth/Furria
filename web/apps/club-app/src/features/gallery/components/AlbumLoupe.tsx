import { KkButton } from '@furria/ui/KkButton';
import { KkFilmEdge } from '@furria/ui/KkFilmEdge';
import { KkFrameFacts } from '@furria/ui/KkFrameFacts';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkViewer } from '@furria/ui/KkViewer';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AlbumFrame } from '../album-frames';
import { LOUPE_DOWNLOAD_LABEL, LOUPE_LABELS } from '../album-labels';
import type { GalleryScene } from '../gallery-scenes';
import { useAlbumLoupe } from '../hooks/use-album-loupe';

const FILMSTRIP_REACH = 12;

interface AlbumLoupeProps {
  albumTitle: string;
  frames: readonly AlbumFrame[];
  scenes: readonly GalleryScene<AlbumFrame>[];
  shown: AlbumFrame | null;
  onShow: (id: number) => void;
  onClose: () => void;
}

export const AlbumLoupe: FC<AlbumLoupeProps> = ({ onClose, ...input }) => {
  const loupe = useAlbumLoupe(input);
  const { facts } = loupe;
  const downloadBlocked = !loupe.canDownload;

  if (facts === null) {
    return null;
  }

  return (
    <KkViewer
      items={loupe.items}
      index={loupe.index}
      labels={LOUPE_LABELS}
      keys={loupe.keys}
      entrance="iris"
      onIndexChange={loupe.show}
      onClose={onClose}
    >
      <KkViewer.Bar>
        <KkViewer.Close />
        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <KkFilmEdge lead={facts.counter} trail={facts.scene} tone="gold" />
        </Stack>
        <KkButton
          variant="outlined"
          size="small"
          startIcon={<KkIcon name="download" size="small" />}
          disabled={downloadBlocked}
          onClick={loupe.download}
        >
          {LOUPE_DOWNLOAD_LABEL}
        </KkButton>
      </KkViewer.Bar>
      <KkViewer.Stage />
      <KkViewer.Foot>
        <KkFrameFacts time={facts.time} facts={facts.facts} />
        <KkViewer.Caption />
        <KkViewer.Filmstrip reach={FILMSTRIP_REACH} onSceneStep={loupe.sceneStep} />
      </KkViewer.Foot>
    </KkViewer>
  );
};

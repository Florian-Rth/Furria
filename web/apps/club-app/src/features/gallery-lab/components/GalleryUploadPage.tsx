import {
  KkButton,
  KkFilmEdge,
  KkFlapCount,
  KkFrame,
  KkFrameGrid,
  KkIcon,
  KkMeta,
  KkScreen,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GALLERY_ORIGIN, UPLOAD_TITLE } from '../gallery-copy';
import { useGalleryUpload } from '../hooks/use-gallery-upload';

interface GalleryUploadPageProps {
  offline: boolean;
}

const DROP_LEAD = 'Ordner hierher ziehen';
const DROP_META = 'JPEG · HEIC · PNG · WebP · MP4 · MOV — Originale bleiben unverändert';
const PICK_LABEL = 'Dateien wählen';

export const GalleryUploadPage: FC<GalleryUploadPageProps> = ({ offline }) => {
  const upload = useGalleryUpload(offline);
  const counterTone = upload.offline ? 'gold' : 'red';
  const scenes = upload.scenes.map((scene) => {
    const tiles = scene.tiles.map((tile) => (
      <KkFrame
        key={tile.id}
        label={tile.label}
        source={tile.source}
        latentLabel={tile.latentLabel}
        state={tile.state}
        progress={tile.progress}
      />
    ));
    return (
      <Stack key={scene.id} sx={{ rowGap: 0.75 }}>
        <KkFilmEdge lead={scene.span} trail={scene.meta} level="h3" sprockets />
        <KkFrameGrid density="map" label={scene.span}>
          {tiles}
        </KkFrameGrid>
      </Stack>
    );
  });

  return (
    <KkScreen kind="detail" title={UPLOAD_TITLE} origin={GALLERY_ORIGIN} thread={upload.thread}>
      <Stack sx={{ rowGap: 2.5, pb: 4 }}>
        <Stack sx={{ rowGap: 0.25 }}>
          <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 1 }}>
            <KkFlapCount value={upload.counter} variant="h2" tone={counterTone} />
            <KkIcon name={upload.offline ? 'offline' : 'upload'} size="small" />
          </Stack>
          <KkMeta tone={upload.offline ? 'accent' : 'muted'}>{upload.meta}</KkMeta>
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'center', columnGap: 1 }}>
          <KkFilmEdge lead={DROP_LEAD} meta={DROP_META} sprockets sx={{ flex: 1 }} />
          <KkButton size="small" variant="outlined">
            {PICK_LABEL}
          </KkButton>
        </Stack>
        {scenes}
      </Stack>
    </KkScreen>
  );
};

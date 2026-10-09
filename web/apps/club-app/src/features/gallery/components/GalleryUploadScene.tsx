import { KkFilmEdge, KkFrame, KkFrameGrid } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { UploadScene } from '../hooks/use-gallery-upload';

interface GalleryUploadSceneProps {
  scene: UploadScene;
}

export const GalleryUploadScene: FC<GalleryUploadSceneProps> = ({ scene }) => {
  const tiles = scene.tiles.map((tile) => (
    <KkFrame
      key={tile.key}
      label={tile.label}
      source={tile.source}
      latentLabel={tile.latentLabel}
      state={tile.state}
      progress={tile.progress}
      onSelect={tile.onRetry}
    />
  ));

  return (
    <Stack component="section" aria-label={scene.span} sx={{ rowGap: 0.75 }}>
      <KkFilmEdge lead={scene.span} trail={scene.meta} level="h3" sprockets />
      <KkFrameGrid density="map" label={scene.span}>
        {tiles}
      </KkFrameGrid>
    </Stack>
  );
};

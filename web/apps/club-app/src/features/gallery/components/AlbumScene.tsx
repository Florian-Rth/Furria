import { KkFilmEdge, KkFrame, KkFrameGrid } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AlbumFrame } from '../album-frames';
import { sceneLabel, sceneMeta } from '../album-labels';
import { albumTileOf } from '../album-tiles';
import type { GalleryScene } from '../gallery-scenes';
import { frameSpanLabel, sceneSpanLabel } from '../gallery-view';
import { sceneAnchorOf } from '../hooks/use-album';

const SCENE_SCROLL_MARGIN = 15;

interface AlbumSceneProps {
  scene: GalleryScene<AlbumFrame>;
  order: number;
  glowId: number | null;
  showsSelection: boolean;
  selecting: boolean;
  selected: ReadonlySet<number>;
  onFrame: (id: number) => void;
}

export const AlbumScene: FC<AlbumSceneProps> = ({
  scene,
  order,
  glowId,
  showsSelection,
  selecting,
  selected,
  onFrame,
}) => {
  const span = sceneSpanLabel(scene);
  const label = sceneLabel(scene.index, span);
  const meta = sceneMeta(scene.frames.length);
  const trail = frameSpanLabel(scene);
  const frames = scene.frames.map((frame) => {
    const tile = albumTileOf(frame, showsSelection);
    const isSelected = selecting && selected.has(frame.id);
    const glows = frame.id === glowId;
    const select = (): void => onFrame(frame.id);
    return (
      <KkFrame key={frame.id} {...tile} selected={isSelected} glow={glows} onSelect={select} />
    );
  });

  return (
    <Stack
      component="section"
      id={sceneAnchorOf(order)}
      aria-label={label}
      sx={{ rowGap: 0.75, scrollMarginTop: (theme) => theme.spacing(SCENE_SCROLL_MARGIN) }}
    >
      <KkFilmEdge lead={span} meta={meta} trail={trail} level="h3" sprockets />
      <KkFrameGrid label={label}>{frames}</KkFrameGrid>
    </Stack>
  );
};

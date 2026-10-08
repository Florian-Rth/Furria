import type { KkFrameMark } from '@furria/ui';
import { KkFilmEdge, KkFrame, KkFrameGrid } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GalleryScene } from '../gallery-scenes';
import { frameNumberOf } from '../gallery-scenes';
import { clockLabel, frameSpanLabel, sceneSpanLabel } from '../gallery-view';
import { sceneAnchorOf } from '../hooks/use-gallery-album';
import type { LabItem } from '../lab-gallery-data';
import { labSourceOf } from '../lab-gallery-data';

const SCENE_SCROLL_MARGIN = 15;

interface GallerySceneBlockProps {
  scene: GalleryScene<LabItem>;
  order: number;
  glowNumber: number | null;
  onOpen: (number: number) => void;
}

const markOf = (item: LabItem): KkFrameMark =>
  item.selection === null ? { kind: 'none' } : { kind: 'selection', order: item.selection };

export const GallerySceneBlock: FC<GallerySceneBlockProps> = ({
  scene,
  order,
  glowNumber,
  onOpen,
}) => {
  const span = sceneSpanLabel(scene);
  const frames = scene.frames.map((item) => {
    const open = (): void => onOpen(item.number);
    return (
      <KkFrame
        key={item.id}
        label={`Bild ${item.number}, ${clockLabel(item.capturedAt)}`}
        source={labSourceOf(item.photo)}
        number={frameNumberOf(item.number)}
        mark={markOf(item)}
        duration={item.duration ?? undefined}
        glow={item.number === glowNumber}
        onSelect={open}
      />
    );
  });

  return (
    <Stack
      component="section"
      id={sceneAnchorOf(order)}
      aria-label={`Szene ${scene.index}, ${span}`}
      sx={{ rowGap: 0.75, scrollMarginTop: (theme) => theme.spacing(SCENE_SCROLL_MARGIN) }}
    >
      <KkFilmEdge
        lead={span}
        meta={`${scene.frames.length} Bilder`}
        trail={frameSpanLabel(scene)}
        level="h3"
        sprockets
      />
      <KkFrameGrid label={`Szene ${scene.index}`}>{frames}</KkFrameGrid>
    </Stack>
  );
};

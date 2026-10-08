import type { KkLoupeStripFrame } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { ALBUM_ROUTE } from '../gallery-copy';
import type { GalleryScene } from '../gallery-scenes';
import { frameNumberOf } from '../gallery-scenes';
import { clockLabel, countLabel } from '../gallery-view';
import type { LabItem } from '../lab-gallery-data';
import { labSourceOf } from '../lab-gallery-data';

const STRIP_REACH = 12;

export interface GalleryLoupe {
  source: string;
  alt: string;
  counter: string;
  time: string;
  scene: string;
  facts: string;
  video: string | undefined;
  strip: KkLoupeStripFrame[];
  onStep: (delta: number) => void;
  onSceneStep: (delta: number) => void;
  onClose: () => void;
  onDownload: () => void;
  onStripSelect: (id: string) => void;
}

const sceneIndexOf = (scenes: readonly GalleryScene<LabItem>[], number: number): number =>
  Math.max(
    scenes.findIndex((scene) => number >= scene.firstNumber && number <= scene.lastNumber),
    0,
  );

export const useGalleryLoupe = (
  albumTitle: string,
  items: readonly LabItem[],
  scenes: readonly GalleryScene<LabItem>[],
  shown: LabItem,
): GalleryLoupe => {
  const navigate = useNavigate({ from: ALBUM_ROUTE });
  const sceneIndex = sceneIndexOf(scenes, shown.number);
  const scene = scenes[sceneIndex];
  const around = (scene?.frames ?? [shown]).filter(
    (item) => Math.abs(item.number - shown.number) <= STRIP_REACH,
  );

  const show = (number: number | undefined): void => {
    void navigate({
      to: ALBUM_ROUTE,
      search: (previous) => ({ ...previous, photo: number }),
      replace: number !== undefined,
    });
  };
  const onStep = (delta: number): void => {
    show(Math.min(Math.max(shown.number + delta, 1), items.length));
  };
  const onSceneStep = (delta: number): void => {
    const target = scenes[sceneIndex + delta];
    if (target !== undefined) {
      show(target.firstNumber);
    }
  };
  const onClose = (): void => show(undefined);
  const onDownload = (): void => undefined;
  const onStripSelect = (id: string): void => {
    const picked = items.find((item) => String(item.id) === id);
    if (picked !== undefined) {
      show(picked.number);
    }
  };

  return {
    source: labSourceOf(shown.photo),
    alt: `${albumTitle}, Bild ${shown.number}`,
    counter: `${frameNumberOf(shown.number)} / ${frameNumberOf(items.length)}`,
    time: clockLabel(shown.capturedAt) || `#${shown.number}`,
    scene: `Szene ${sceneIndex + 1} von ${countLabel(scenes.length)}`,
    facts: `${shown.camera} · Fotos: ${shown.uploader}`,
    video: shown.duration ?? undefined,
    strip: around.map((item) => ({
      id: String(item.id),
      label: `Bild ${item.number}`,
      source: labSourceOf(item.photo),
      current: item.number === shown.number,
    })),
    onStep,
    onSceneStep,
    onClose,
    onDownload,
    onStripSelect,
  };
};

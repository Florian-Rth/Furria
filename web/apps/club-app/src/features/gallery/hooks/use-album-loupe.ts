import type { KkLoupeStripFrame, KkLoupeVideo } from '@furria/ui';
import type { AlbumFrame } from '../album-frames';
import { framesAround, sceneIndexOfFrame, steppedNumber } from '../album-frames';
import { loupeAlt, loupeFacts, loupeSceneLine } from '../album-labels';
import type { GalleryScene } from '../gallery-scenes';
import { frameNumberOf } from '../gallery-scenes';
import { clockLabel, durationLabel, shownSourceOf, viewSourceOf } from '../gallery-view';

const STRIP_REACH = 12;

export interface AlbumLoupe {
  source: string | undefined;
  alt: string;
  counter: string;
  time: string;
  scene: string;
  facts: string;
  caption: string | undefined;
  video: KkLoupeVideo | undefined;
  strip: KkLoupeStripFrame[];
  onStep: (delta: number) => void;
  onSceneStep: (delta: number) => void;
  onClose: () => void;
  onDownload: () => void;
  onStripSelect: (id: string) => void;
}

interface AlbumLoupeInput {
  albumTitle: string;
  frames: readonly AlbumFrame[];
  scenes: readonly GalleryScene<AlbumFrame>[];
  shown: AlbumFrame;
  onShow: (id: number) => void;
  onClose: () => void;
}

const videoOf = (frame: AlbumFrame): KkLoupeVideo | undefined => {
  const { item } = frame;
  if (item.kind !== 'video' || item.urls.video === null || item.state !== 'ready') {
    return undefined;
  }
  return { source: item.urls.video, duration: durationLabel(item.durationSeconds) ?? '' };
};

export const useAlbumLoupe = ({
  albumTitle,
  frames,
  scenes,
  shown,
  onShow,
  onClose,
}: AlbumLoupeInput): AlbumLoupe => {
  const sceneIndex = sceneIndexOfFrame(scenes, shown.number);
  const scene = scenes[sceneIndex];
  const around = framesAround(scene?.frames ?? [shown], shown.number, STRIP_REACH);

  const showNumber = (number: number): void => {
    const target = frames[number - 1];
    if (target !== undefined) {
      onShow(target.id);
    }
  };

  const onStep = (delta: number): void => {
    showNumber(steppedNumber(shown.number, delta, frames.length));
  };

  const onSceneStep = (delta: number): void => {
    const target = scenes[sceneIndex + delta];
    if (target !== undefined) {
      showNumber(target.firstNumber);
    }
  };

  const onDownload = (): void => {
    window.location.assign(shown.item.urls.download);
  };

  const onStripSelect = (id: string): void => {
    onShow(Number(id));
  };

  return {
    source:
      shown.item.state === 'ready' ? viewSourceOf(shown.item.kind, shown.item.urls) : undefined,
    alt: shown.item.caption ?? loupeAlt(albumTitle, shown.number),
    counter: `${frameNumberOf(shown.number)} / ${frameNumberOf(frames.length)}`,
    time: clockLabel(shown.capturedAt) || `#${shown.number}`,
    scene: loupeSceneLine(sceneIndex + 1, scenes.length),
    facts: loupeFacts(shown.item),
    caption: shown.item.caption ?? undefined,
    video: videoOf(shown),
    strip: around.map((frame) => ({
      id: String(frame.id),
      label: loupeAlt(albumTitle, frame.number),
      source: shownSourceOf(frame.item),
      current: frame.id === shown.id,
    })),
    onStep,
    onSceneStep,
    onClose,
    onDownload,
    onStripSelect,
  };
};

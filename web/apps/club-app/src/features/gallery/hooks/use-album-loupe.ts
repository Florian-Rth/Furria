import type { KkViewerItem, KkViewerKeys, KkViewerStepDelta } from '@furria/ui/viewer-types';
import { useState } from 'react';
import { saveFile } from '@/lib/media/save-file';
import type { AlbumFrame } from '../album-frames';
import { sceneIndexOfFrame } from '../album-frames';
import { loupeFacts, loupeSceneLine } from '../album-labels';
import { albumViewerItemOf } from '../album-viewer-items';
import type { GalleryScene } from '../gallery-scenes';
import { frameNumberOf } from '../gallery-scenes';
import { clockLabel } from '../gallery-view';

export interface AlbumLoupeFacts {
  counter: string;
  scene: string;
  time: string;
  facts: string;
}

export interface AlbumLoupe {
  items: KkViewerItem[];
  index: number | null;
  facts: AlbumLoupeFacts | null;
  keys: KkViewerKeys;
  show: (index: number) => void;
  sceneStep: (delta: KkViewerStepDelta) => void;
  canDownload: boolean;
  download: () => void;
}

interface AlbumLoupeInput {
  albumTitle: string;
  frames: readonly AlbumFrame[];
  scenes: readonly GalleryScene<AlbumFrame>[];
  shown: AlbumFrame | null;
  onShow: (id: number) => void;
}

const useLastShown = (shown: AlbumFrame | null): AlbumFrame | null => {
  const [last, setLast] = useState(shown);

  if (shown !== null && shown !== last) {
    setLast(shown);
  }

  return shown ?? last;
};

const factsOf = (
  frame: AlbumFrame,
  total: number,
  sceneIndex: number,
  sceneCount: number,
): AlbumLoupeFacts => ({
  counter: `${frameNumberOf(frame.number)} / ${frameNumberOf(total)}`,
  scene: loupeSceneLine(sceneIndex + 1, sceneCount),
  time: clockLabel(frame.capturedAt) || `#${frame.number}`,
  facts: loupeFacts(frame.item),
});

export const useAlbumLoupe = ({
  albumTitle,
  frames,
  scenes,
  shown,
  onShow,
}: AlbumLoupeInput): AlbumLoupe => {
  const lastShown = useLastShown(shown);
  const sceneIndex = lastShown === null ? -1 : sceneIndexOfFrame(scenes, lastShown.number);
  const index = shown === null ? null : frames.findIndex((frame) => frame.id === shown.id);

  const show = (target: number): void => {
    const frame = frames[target];
    if (frame !== undefined) {
      onShow(frame.id);
    }
  };

  const sceneStep = (delta: KkViewerStepDelta): void => {
    const target = scenes[sceneIndex + delta];
    if (target !== undefined) {
      show(target.firstNumber - 1);
    }
  };

  const canDownload = lastShown?.item.state === 'ready';

  const download = (): void => {
    if (lastShown !== null && canDownload) {
      saveFile(lastShown.item.urls.download);
    }
  };

  return {
    items: frames.map((frame) => albumViewerItemOf(frame, albumTitle)),
    index: index === -1 ? null : index,
    facts: lastShown === null ? null : factsOf(lastShown, frames.length, sceneIndex, scenes.length),
    keys: {
      PageDown: () => sceneStep(1),
      PageUp: () => sceneStep(-1),
      d: download,
    },
    show,
    sceneStep,
    canDownload,
    download,
  };
};

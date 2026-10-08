import type { KkFrameState, KkScreenThread } from '@furria/ui';
import { useState } from 'react';
import type { GalleryScene } from '../gallery-scenes';
import { scenesOf } from '../gallery-scenes';
import { clockLabel, countLabel, sceneSpanLabel } from '../gallery-view';
import type { LabItem } from '../lab-gallery-data';
import { LAB_ALBUMS, labItemsOf, labSourceOf } from '../lab-gallery-data';
import { remainingMinutesAt, sentCountAt, uploadMomentAt } from '../upload-run';
import { UPLOAD_TOTAL, useUploadElapsed } from './use-upload-thread';

const FAILING = new Set([37, 211, 405]);
const LATENT_EVERY = 6;

export interface UploadTile {
  id: number;
  label: string;
  source: string | undefined;
  latentLabel: string;
  state: KkFrameState;
  progress: number;
}

export interface UploadScene {
  id: number;
  span: string;
  meta: string;
  tiles: UploadTile[];
}

export interface GalleryUpload {
  counter: string;
  meta: string;
  offline: boolean;
  thread: KkScreenThread;
  scenes: UploadScene[];
}

const buildBatch = (): GalleryScene<LabItem>[] => {
  const album = LAB_ALBUMS[0];
  const items = album === undefined ? [] : labItemsOf(album).slice(0, UPLOAD_TOTAL);
  return scenesOf(items);
};

export const useGalleryUpload = (offline: boolean): GalleryUpload => {
  const [scenes] = useState(buildBatch);
  const elapsed = useUploadElapsed(!offline);
  const sent = sentCountAt(UPLOAD_TOTAL, elapsed);
  const minutes = remainingMinutesAt(UPLOAD_TOTAL, elapsed);
  const failed = [...FAILING].filter((position) => position < sent).length;

  const uploadScenes: UploadScene[] = scenes.map((scene) => {
    const tiles = scene.frames.map((item) => {
      const position = item.number - 1;
      const moment = uploadMomentAt(position, elapsed, FAILING.has(position));
      const latent = item.number % LATENT_EVERY === 0 && moment.phase !== 'ready';
      return {
        id: item.id,
        label: `Bild ${item.number}, ${clockLabel(item.capturedAt)}`,
        source: latent ? undefined : labSourceOf(item.photo),
        latentLabel: clockLabel(item.capturedAt),
        state: moment.phase,
        progress: moment.progress,
      };
    });
    const ready = tiles.filter((tile) => tile.state === 'ready').length;
    return {
      id: scene.index,
      span: sceneSpanLabel(scene),
      meta: `${tiles.length} Bilder · ${ready} fertig`,
      tiles,
    };
  });

  return {
    counter: `${sent} / ${UPLOAD_TOTAL}`,
    meta: offline
      ? `Pausiert · setzt fort, sobald Netz da ist · ${failed} fehlgeschlagen`
      : `noch ca. ${minutes} min · 4 parallel · ${failed} fehlgeschlagen · Ziel: Eingang`,
    offline,
    thread: {
      value: sent / UPLOAD_TOTAL,
      tone: offline ? 'gold' : 'accent',
      label: `${countLabel(sent)} von ${countLabel(UPLOAD_TOTAL)} hochgeladen`,
    },
    scenes: uploadScenes,
  };
};

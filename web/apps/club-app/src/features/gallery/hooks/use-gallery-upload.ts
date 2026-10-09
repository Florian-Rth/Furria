import type { KkFrameState, KkScreenActions, KkScreenThread } from '@furria/ui';
import { useSearch } from '@tanstack/react-router';
import type { ChangeEvent, DragEvent, RefCallback } from 'react';
import { useRef, useState } from 'react';
import { useDevelopedItems, useGalleryHubQuery } from '../api';
import { scenesOf } from '../gallery-scenes';
import { clockLabel, sceneSpanLabel } from '../gallery-view';
import { filesOfDrop, filesOfPick } from '../upload/folder-drop';
import {
  CANCEL_ALL_LABEL,
  CLEAR_LABEL,
  counterOf,
  INBOX_TARGET,
  RETRY_ALL_LABEL,
  sceneMetaOf,
  statusLineOf,
  threadLabelOf,
  tileLabelOf,
} from '../upload/upload-copy';
import type { UploadEntry } from '../upload/upload-queue';
import { inCaptureOrder, tallyOf, targetsOf } from '../upload/upload-queue';
import type { UploadStatus } from '../upload/upload-status';
import { uploadStatusOf } from '../upload/upload-status';
import {
  cancelOpenUploads,
  clearFinishedUploads,
  enqueueUploads,
  retryFailedUploads,
  retryUpload,
} from '../upload/upload-store';
import { isDeveloped, tileLookOf } from '../upload/upload-tiles';
import { useUploads } from '../upload/use-uploads';

const UPLOAD_ROUTE_ID = '/_app/gallery_/upload';

export interface UploadTile {
  key: number;
  label: string;
  source: string | undefined;
  latentLabel: string;
  state: KkFrameState;
  progress: number;
  onRetry: (() => void) | undefined;
}

export interface UploadScene {
  id: number;
  span: string;
  meta: string;
  tiles: UploadTile[];
}

export type UploadMood = 'running' | 'paused' | 'idle';

export interface GalleryUpload {
  counter: string;
  statusLine: string;
  mood: UploadMood;
  thread: KkScreenThread | undefined;
  actions: KkScreenActions | undefined;
  scenes: UploadScene[];
  isEmpty: boolean;
  dragging: boolean;
  fileInput: RefCallback<HTMLInputElement>;
  folderInput: RefCallback<HTMLInputElement>;
  onPickFiles: () => void;
  onPickFolder: () => void;
  onPicked: (event: ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

const moodOf = (status: UploadStatus): UploadMood => {
  switch (status.kind) {
    case 'running':
      return 'running';
    case 'paused':
      return 'paused';
    default:
      return 'idle';
  }
};

const threadOf = (status: UploadStatus): KkScreenThread | undefined => {
  switch (status.kind) {
    case 'running':
      return { value: status.share, tone: 'accent', label: threadLabelOf(status) };
    case 'paused':
      return { value: status.share, tone: 'gold', label: threadLabelOf(status) };
    default:
      return undefined;
  }
};

const carriesFiles = (event: DragEvent<HTMLElement>): boolean =>
  event.dataTransfer.types.includes('Files');

export const useGalleryUpload = (): GalleryUpload => {
  const { album } = useSearch({ from: UPLOAD_ROUTE_ID });
  const albumId = album ?? null;
  const uploads = useUploads();
  const hub = useGalleryHubQuery();
  const developed = useDevelopedItems(targetsOf(uploads.entries, albumId));
  const fileField = useRef<HTMLInputElement | null>(null);
  const folderField = useRef<HTMLInputElement | null>(null);
  const [dragDepth, setDragDepth] = useState(0);

  const tally = tallyOf(uploads.entries);
  const status = uploadStatusOf(tally, uploads.paused, uploads.bytesPerSecond);
  const targetTitle =
    albumId === null
      ? INBOX_TARGET
      : (hub.data?.sections
          .flatMap((section) => section.albums)
          .find((entry) => entry.albumId === albumId)?.title ?? INBOX_TARGET);

  const tileOf = (entry: UploadEntry): UploadTile => {
    const look = tileLookOf(
      entry,
      entry.mediaItemId === null ? undefined : developed.get(entry.mediaItemId),
    );
    const clock = clockLabel(entry.capturedAt);
    return {
      key: entry.key,
      label: tileLabelOf(entry.name, clock, entry.failure),
      source: look.source,
      latentLabel: clock,
      state: look.state,
      progress: look.progress,
      onRetry: look.retryable ? () => retryUpload(entry.key) : undefined,
    };
  };

  const frames = inCaptureOrder(uploads.entries).map((entry) => ({
    id: entry.key,
    capturedAt: entry.capturedAt,
    entry,
  }));
  const scenes: UploadScene[] = scenesOf(frames).map((scene) => {
    const tiles = scene.frames.map((frame) => tileOf(frame.entry));
    const ready = scene.frames.filter((frame) =>
      isDeveloped(
        tileLookOf(
          frame.entry,
          frame.entry.mediaItemId === null ? undefined : developed.get(frame.entry.mediaItemId),
        ),
      ),
    ).length;
    return {
      id: scene.index,
      span: sceneSpanLabel(scene),
      meta: sceneMetaOf(tiles.length, ready),
      tiles,
    };
  });

  const enqueue = (files: readonly File[]): void => {
    enqueueUploads(files, albumId);
  };

  const finished = uploads.entries.some(
    (entry) => entry.phase === 'sent' || entry.phase === 'refused',
  );
  const actions: KkScreenActions | undefined =
    tally.failed > 0
      ? [{ id: 'retry', label: RETRY_ALL_LABEL, icon: 'undo', onSelect: retryFailedUploads }]
      : tally.active > 0
        ? [{ id: 'cancel', label: CANCEL_ALL_LABEL, icon: 'close', onSelect: cancelOpenUploads }]
        : finished
          ? [{ id: 'clear', label: CLEAR_LABEL, icon: 'check', onSelect: clearFinishedUploads }]
          : undefined;

  return {
    counter: counterOf(status),
    statusLine: statusLineOf(status, tally.failed, targetTitle),
    mood: moodOf(status),
    thread: threadOf(status),
    actions,
    scenes,
    isEmpty: uploads.entries.length === 0,
    dragging: dragDepth > 0,
    fileInput: (node) => {
      fileField.current = node;
    },
    folderInput: (node) => {
      folderField.current = node;
      node?.setAttribute('webkitdirectory', '');
    },
    onPickFiles: () => fileField.current?.click(),
    onPickFolder: () => folderField.current?.click(),
    onPicked: (event) => {
      enqueue(filesOfPick(event.currentTarget.files));
      event.currentTarget.value = '';
    },
    onDragEnter: (event) => {
      if (carriesFiles(event)) {
        event.preventDefault();
        setDragDepth((depth) => depth + 1);
      }
    },
    onDragOver: (event) => {
      if (carriesFiles(event)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }
    },
    onDragLeave: (event) => {
      if (carriesFiles(event)) {
        setDragDepth((depth) => Math.max(depth - 1, 0));
      }
    },
    onDrop: (event) => {
      event.preventDefault();
      setDragDepth(0);
      void filesOfDrop(event.dataTransfer).then(enqueue);
    },
  };
};

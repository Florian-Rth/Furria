import { apiStatusOf } from '@furria/api-client';
import { useLocation } from '@tanstack/react-router';
import type { ChangeEvent, RefCallback } from 'react';
import { useEffect, useRef, useState } from 'react';
import { scenesOf } from '@/features/gallery/gallery-scenes';
import { clockLabel, sceneSpanLabel } from '@/features/gallery/gallery-view';
import type {
  UploadMood,
  UploadScene,
  UploadTile,
} from '@/features/gallery/hooks/use-gallery-upload';
import { filesOfPick } from '@/features/gallery/upload/folder-drop';
import {
  counterOf,
  sceneMetaOf,
  statusLineOf,
  tileLabelOf,
} from '@/features/gallery/upload/upload-copy';
import type { UploadEntry } from '@/features/gallery/upload/upload-queue';
import { inCaptureOrder, tallyOf } from '@/features/gallery/upload/upload-queue';
import type { UploadStatus } from '@/features/gallery/upload/upload-status';
import { uploadStatusOf } from '@/features/gallery/upload/upload-status';
import { isDeveloped, tileLookOf } from '@/features/gallery/upload/upload-tiles';
import { useUploadLinkLookupQuery } from '../api';
import { retryFailedLinkUploads, retryLinkUpload, sendThroughLink } from '../link-upload-store';
import { momentLabelOf } from '../upload-link-copy';
import type { LinkPageStage } from '../upload-link-view';
import { linkPageStageOf, tokenOfHash } from '../upload-link-view';
import { useLinkUploads } from './use-link-uploads';

const NAME_STORAGE_KEY = 'furria.upload-link.name';

export interface LinkUploadPage {
  stage: LinkPageStage;
  title: string;
  openUntil: string;
  name: string;
  counter: string;
  statusLine: string;
  mood: UploadMood;
  scenes: UploadScene[];
  hasUploads: boolean;
  hasFailures: boolean;
  checking: boolean;
  fileInput: RefCallback<HTMLInputElement>;
  onName: (event: ChangeEvent<HTMLInputElement>) => void;
  onPick: () => void;
  onPicked: (event: ChangeEvent<HTMLInputElement>) => void;
  onRetryFailed: () => void;
  onRecheck: () => void;
}

const readStoredName = (): string => {
  try {
    return window.localStorage.getItem(NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

const storeName = (name: string): void => {
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, name);
  } catch {
    return;
  }
};

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

const tileOf = (entry: UploadEntry): UploadTile => {
  const look = tileLookOf(entry, undefined);
  const clock = clockLabel(entry.capturedAt);
  return {
    key: entry.key,
    label: tileLabelOf(entry.name, clock, entry.failure),
    source: look.source,
    latentLabel: clock,
    state: look.state,
    progress: look.progress,
    onRetry: look.retryable ? () => retryLinkUpload(entry.key) : undefined,
  };
};

const scenesOfEntries = (entries: readonly UploadEntry[]): UploadScene[] => {
  const frames = inCaptureOrder(entries).map((entry) => ({
    id: entry.key,
    capturedAt: entry.capturedAt,
    entry,
  }));
  return scenesOf(frames).map((scene) => {
    const tiles = scene.frames.map((frame) => tileOf(frame.entry));
    const sent = scene.frames.filter((frame) =>
      isDeveloped(tileLookOf(frame.entry, undefined)),
    ).length;
    return {
      id: scene.index,
      span: sceneSpanLabel(scene),
      meta: sceneMetaOf(tiles.length, sent),
      tiles,
    };
  });
};

export const useLinkUploadPage = (): LinkUploadPage => {
  const { hash } = useLocation();
  const token = tokenOfHash(hash);
  const lookup = useUploadLinkLookupQuery(token);
  const uploads = useLinkUploads();
  const fileField = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(readStoredName);

  const tally = tallyOf(uploads.entries);
  const status = uploadStatusOf(tally, uploads.paused, uploads.bytesPerSecond);
  const endedCount = uploads.entries.filter((entry) => entry.failure === 'ended').length;
  const stage = linkPageStageOf(token, {
    state: lookup.data?.state ?? null,
    failedStatus: apiStatusOf(lookup.error),
    failed: lookup.isError,
  });
  const title = lookup.data?.title ?? '';
  const { refetch } = lookup;

  useEffect(() => {
    if (endedCount > 0) {
      void refetch();
    }
  }, [endedCount, refetch]);

  return {
    stage,
    title,
    openUntil: lookup.data === undefined ? '' : momentLabelOf(lookup.data.expiresAt),
    name,
    counter: counterOf(status),
    statusLine: statusLineOf(status, tally.failed, title),
    mood: moodOf(status),
    scenes: scenesOfEntries(uploads.entries),
    hasUploads: uploads.entries.length > 0,
    hasFailures: tally.failed > 0,
    checking: lookup.isFetching,
    fileInput: (node) => {
      fileField.current = node;
    },
    onName: (event) => {
      setName(event.target.value);
      storeName(event.target.value);
    },
    onPick: () => fileField.current?.click(),
    onPicked: (event) => {
      if (token !== null) {
        sendThroughLink(filesOfPick(event.currentTarget.files), token, name);
      }
      event.currentTarget.value = '';
    },
    onRetryFailed: retryFailedLinkUploads,
    onRecheck: () => {
      void refetch();
    },
  };
};

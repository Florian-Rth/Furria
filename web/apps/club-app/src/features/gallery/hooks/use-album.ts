import type { KkFilterOption, KkScreenActions, KkTimeRailScene } from '@furria/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isNotFoundError } from '@/lib/query-error';
import type { AlbumFrame } from '../album-frames';
import { albumFramesOf } from '../album-frames';
import {
  ALL_FILTER,
  kindOptionsOf,
  SELECT_DONE_LABEL,
  SELECT_LABEL,
  sceneMeta,
  uploaderOptionsOf,
  ZIP_LABEL,
} from '../album-labels';
import { useAlbumQuery } from '../api';
import type { AlbumKindFilter } from '../gallery-copy';
import { ALBUM_ROUTE, AlbumKindFilterSchema } from '../gallery-copy';
import type { GalleryScene } from '../gallery-scenes';
import { scenesOf } from '../gallery-scenes';
import { railScenesOf, sceneSpanLabel, thumbSourceOf } from '../gallery-view';
import type { AlbumDetails } from '../schemas';
import type { AlbumSelecting } from './use-album-selecting';
import { useAlbumSelecting } from './use-album-selecting';
import { useSceneInView } from './use-scene-in-view';

const ALBUM_ROUTE_ID = '/_app/gallery_/$albumId';
const SCENE_ANCHOR_PREFIX = 'szene-';

export type AlbumStatus = 'ready' | 'loading' | 'missing' | 'failed';

export interface AlbumRights {
  managesItems: boolean;
  curates: boolean;
  uploads: boolean;
}

export interface AlbumScreen {
  status: AlbumStatus;
  album: AlbumDetails | undefined;
  frames: AlbumFrame[];
  scenes: GalleryScene<AlbumFrame>[];
  filtered: boolean;
  kind: string;
  kindOptions: KkFilterOption[];
  uploader: string;
  uploaderOptions: KkFilterOption[];
  railScenes: KkTimeRailScene[];
  currentScene: number;
  shown: AlbumFrame | null;
  glowId: number | null;
  rights: AlbumRights;
  selecting: AlbumSelecting;
  actions: KkScreenActions | undefined;
  setKind: (kind: string) => void;
  setUploader: (uploader: string) => void;
  reachScene: (index: number) => void;
  openFrame: (id: number) => void;
  showFrame: (id: number) => void;
  closeFrame: () => void;
  retry: () => void;
}

export const sceneAnchorOf = (index: number): string => `${SCENE_ANCHOR_PREFIX}${index}`;

const statusOf = (data: AlbumDetails | undefined, error: Error | null): AlbumStatus => {
  if (data !== undefined) {
    return 'ready';
  }
  if (isNotFoundError(error)) {
    return 'missing';
  }
  return error === null ? 'loading' : 'failed';
};

const kindOf = (value: string): AlbumKindFilter | undefined => {
  const parsed = AlbumKindFilterSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

const uploaderOf = (value: string): number | undefined =>
  value === ALL_FILTER ? undefined : Number(value);

const middleSourceOf = (scene: GalleryScene<AlbumFrame> | undefined): string | undefined => {
  const middle = scene?.frames[Math.floor(scene.frames.length / 2)];
  return middle === undefined || middle.item.state !== 'ready'
    ? undefined
    : thumbSourceOf(middle.item.urls);
};

const scrollToFrame = (id: number): void => {
  window.requestAnimationFrame(() => {
    document
      .querySelector(`[data-kk-frame-id="${id}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
};

export const useAlbum = (albumId: number): AlbumScreen => {
  const search = useSearch({ from: ALBUM_ROUTE_ID });
  const navigate = useNavigate({ from: ALBUM_ROUTE });
  const { has } = usePermissions();
  const [glowId, setGlowId] = useState<number | null>(null);
  const filter = { kind: search.kind ?? null, uploaderPersonId: search.uploader ?? null };
  const query = useAlbumQuery(albumId, filter);
  const album = query.data;
  const frames = albumFramesOf(album?.items ?? []);
  const scenes = scenesOf(frames);
  const order = frames.map((frame) => frame.id);
  const sceneInView = useSceneInView(scenes.map((_, index) => sceneAnchorOf(index)));

  const rights: AlbumRights = {
    managesItems: has(PERMISSION_KEYS.galleryManage),
    curates: has(PERMISSION_KEYS.galleryPublish),
    uploads: has(PERMISSION_KEYS.galleryUpload) || has(PERMISSION_KEYS.galleryManage),
  };
  const selecting = useAlbumSelecting(order, rights.managesItems || rights.curates);
  const shown =
    search.photo === undefined ? null : (frames.find((frame) => frame.id === search.photo) ?? null);

  const railScenes: KkTimeRailScene[] = railScenesOf(scenes).map((rail, index) => {
    const scene = scenes[index];
    return {
      ...rail,
      caption: scene === undefined ? '' : sceneMeta(scene.frames.length),
      time: scene === undefined ? rail.time : sceneSpanLabel(scene).slice(0, 5),
      source: middleSourceOf(scene),
    };
  });

  const setKind = (next: string): void => {
    void navigate({
      to: ALBUM_ROUTE,
      search: (previous) => ({ ...previous, kind: kindOf(next), photo: undefined }),
      replace: true,
    });
  };

  const setUploader = (next: string): void => {
    void navigate({
      to: ALBUM_ROUTE,
      search: (previous) => ({ ...previous, uploader: uploaderOf(next), photo: undefined }),
      replace: true,
    });
  };

  const reachScene = (index: number): void => {
    sceneInView.setCurrent(index);
    document.getElementById(sceneAnchorOf(index))?.scrollIntoView({ block: 'start' });
  };

  const openFrame = (id: number): void => {
    setGlowId(null);
    void navigate({ to: ALBUM_ROUTE, search: (previous) => ({ ...previous, photo: id }) });
  };

  const showFrame = (id: number): void => {
    void navigate({
      to: ALBUM_ROUTE,
      search: (previous) => ({ ...previous, photo: id }),
      replace: true,
    });
  };

  const closeFrame = (): void => {
    if (shown !== null) {
      setGlowId(shown.id);
      scrollToFrame(shown.id);
    }
    void navigate({
      to: ALBUM_ROUTE,
      search: (previous) => ({ ...previous, photo: undefined }),
      replace: true,
    });
  };

  const downloadZip = (): void => {
    if (album !== undefined) {
      window.location.assign(album.zipUrl);
    }
  };

  const zipAction = { id: 'zip', label: ZIP_LABEL, icon: 'zip', onSelect: downloadZip } as const;
  const canSelect = (rights.managesItems || rights.curates) && frames.length > 0;
  const browsingActions: KkScreenActions = canSelect
    ? [zipAction, { id: 'select', label: SELECT_LABEL, icon: 'select', onSelect: selecting.start }]
    : [zipAction];
  const selectingActions: KkScreenActions = [
    {
      id: 'done',
      label: SELECT_DONE_LABEL,
      icon: 'check',
      onSelect: selecting.stop,
      emphasis: true,
    },
  ];

  return {
    status: statusOf(album, query.error),
    album,
    frames,
    scenes,
    filtered: search.kind !== undefined || search.uploader !== undefined,
    kind: search.kind ?? ALL_FILTER,
    kindOptions: album === undefined ? [] : kindOptionsOf(album),
    uploader: search.uploader === undefined ? ALL_FILTER : String(search.uploader),
    uploaderOptions: album === undefined ? [] : uploaderOptionsOf(album),
    railScenes,
    currentScene: sceneInView.current,
    shown,
    glowId: shown === null ? glowId : null,
    rights,
    selecting,
    actions:
      album === undefined ? undefined : selecting.active ? selectingActions : browsingActions,
    setKind,
    setUploader,
    reachScene,
    openFrame,
    showFrame,
    closeFrame,
    retry: () => {
      void query.refetch();
    },
  };
};

import type { KkFilterOption, KkScreenActions, KkTimeRailScene } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { AlbumSearch, LabView } from '../gallery-copy';
import { ALBUM_ROUTE, SELECT_LABEL, ZIP_LABEL } from '../gallery-copy';
import type { GalleryScene } from '../gallery-scenes';
import { scenesOf } from '../gallery-scenes';
import { countLabel, countsOf, railScenesOf, sceneSpanLabel } from '../gallery-view';
import type { LabAlbumSpec, LabItem } from '../lab-gallery-data';
import { labItemsOf, labSourceOf } from '../lab-gallery-data';

export type AlbumKindFilter = 'all' | 'photo' | 'video';

export interface GalleryAlbum {
  items: LabItem[];
  scenes: GalleryScene<LabItem>[];
  selection: LabItem[];
  kind: AlbumKindFilter;
  kindOptions: KkFilterOption[];
  railScenes: KkTimeRailScene[];
  currentScene: number;
  actions: KkScreenActions;
  manages: boolean;
  glowNumber: number | null;
  shown: LabItem | null;
  setKind: (kind: string) => void;
  reachScene: (index: number) => void;
  openPhoto: (number: number) => void;
}

export const sceneAnchorOf = (index: number): string => `szene-${index}`;

const isKind = (value: string): value is AlbumKindFilter =>
  value === 'all' || value === 'photo' || value === 'video';

const matchesKind =
  (kind: AlbumKindFilter) =>
  (item: LabItem): boolean =>
    kind === 'all' || item.kind === kind;

export const useGalleryAlbum = (
  album: LabAlbumSpec,
  search: AlbumSearch,
  view: LabView,
): GalleryAlbum => {
  const navigate = useNavigate({ from: ALBUM_ROUTE });
  const [items] = useState(() => labItemsOf(album));
  const [currentScene, setCurrentScene] = useState(0);
  const [glowNumber, setGlowNumber] = useState<number | null>(null);
  const kind = search.kind ?? 'all';
  const shownItems = items.filter(matchesKind(kind));
  const scenes = scenesOf(shownItems);
  const counts = countsOf(items);
  const selection = items
    .filter((item) => item.selection !== null)
    .sort((left, right) => (left.selection ?? 0) - (right.selection ?? 0));
  const manages = view === 'manage';
  const shown = search.photo === undefined ? null : (items[search.photo - 1] ?? null);

  const railScenes: KkTimeRailScene[] = railScenesOf(scenes).map((rail, index) => {
    const scene = scenes[index];
    const sample = scene?.frames[Math.floor((scene?.frames.length ?? 0) / 2)];
    return {
      ...rail,
      caption: scene === undefined ? '' : `${scene.frames.length} Bilder`,
      time: scene === undefined ? rail.time : sceneSpanLabel(scene).slice(0, 5),
      source: sample === undefined ? undefined : labSourceOf(sample.photo),
    };
  });

  const setKind = (next: string): void => {
    if (!isKind(next)) {
      return;
    }
    void navigate({
      to: ALBUM_ROUTE,
      search: (previous) => ({ ...previous, kind: next }),
      replace: true,
    });
  };

  const reachScene = (index: number): void => {
    setCurrentScene(index);
    document.getElementById(sceneAnchorOf(index))?.scrollIntoView({ block: 'start' });
  };

  const openPhoto = (number: number): void => {
    setGlowNumber(number);
    void navigate({ to: ALBUM_ROUTE, search: (previous) => ({ ...previous, photo: number }) });
  };

  const noop = (): void => undefined;
  const actions: KkScreenActions = manages
    ? [
        { id: 'zip', label: ZIP_LABEL, icon: 'zip', onSelect: noop },
        { id: 'select', label: SELECT_LABEL, icon: 'select', onSelect: noop },
      ]
    : [{ id: 'zip', label: ZIP_LABEL, icon: 'zip', onSelect: noop }];

  const kindOptions: KkFilterOption[] = [
    { id: 'all', label: 'Alle', count: items.length },
    { id: 'photo', label: 'Fotos', count: counts.photos },
    { id: 'video', label: 'Videos', count: counts.videos },
  ];

  return {
    items,
    scenes,
    selection,
    kind,
    kindOptions,
    railScenes,
    currentScene,
    actions,
    manages,
    glowNumber: shown === null ? glowNumber : null,
    shown,
    setKind,
    reachScene,
    openPhoto,
  };
};

export const totalLabel = (items: readonly LabItem[]): string => countLabel(items.length);

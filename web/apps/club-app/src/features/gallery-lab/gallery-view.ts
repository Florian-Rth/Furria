import type { GalleryScene, SceneFrame } from './gallery-scenes';
import { frameNumberOf, sceneSamplesOf, scenesOf } from './gallery-scenes';
import type { LabAlbumSpec, LabItem, LabSession } from './lab-gallery-data';
import { labItemsOf } from './lab-gallery-data';

export const HUB_SAMPLES = 8;

const GERMAN = new Intl.NumberFormat('de-DE');

export const countLabel = (count: number): string => GERMAN.format(count);

export const clockLabel = (capturedAt: string | null): string =>
  capturedAt === null ? '' : capturedAt.slice(11, 16);

export const hourLabel = (capturedAt: string | null): string | null =>
  capturedAt === null ? null : capturedAt.slice(11, 13);

export const dayLabel = (date: string | null): string | null =>
  date === null ? null : `${date.slice(8, 10)}.${date.slice(5, 7)}.`;

export const sceneSpanLabel = <TFrame extends SceneFrame>(scene: GalleryScene<TFrame>): string => {
  const from = clockLabel(scene.startsAt);
  const to = clockLabel(scene.endsAt);
  if (from === '') {
    return `Bild ${scene.firstNumber}–${scene.lastNumber}`;
  }
  return from === to ? from : `${from}–${to}`;
};

export const frameSpanLabel = <TFrame extends SceneFrame>(scene: GalleryScene<TFrame>): string =>
  `#${frameNumberOf(scene.firstNumber)}–${frameNumberOf(scene.lastNumber)}`;

export interface AlbumCounts {
  photos: number;
  videos: number;
}

export const countsOf = (items: readonly LabItem[]): AlbumCounts => ({
  photos: items.filter((item) => item.kind === 'photo').length,
  videos: items.filter((item) => item.kind === 'video').length,
});

export const countsLine = ({ photos, videos }: AlbumCounts): string =>
  videos === 0
    ? `${countLabel(photos)} Fotos`
    : `${countLabel(photos)} Fotos · ${countLabel(videos)} Videos`;

export const albumMetaLine = (album: LabAlbumSpec, counts: AlbumCounts): string => {
  const day = dayLabel(album.entryDate);
  return day === null ? countsLine(counts) : `${day} · ${countsLine(counts)}`;
};

export const coverOf = (items: readonly LabItem[]): LabItem | undefined =>
  items.find((item) => item.selection === 1) ?? items[0];

export interface HubAlbum {
  album: LabAlbumSpec;
  items: LabItem[];
  scenes: GalleryScene<LabItem>[];
  cover: LabItem | undefined;
  samples: LabItem[];
  counts: AlbumCounts;
}

export interface HubSection {
  id: string;
  session: LabSession | null;
  albums: HubAlbum[];
  counts: AlbumCounts;
}

export const hubAlbumOf = (album: LabAlbumSpec): HubAlbum => {
  const items = labItemsOf(album);
  const scenes = scenesOf(items);
  const cover = coverOf(items);
  const samples = sceneSamplesOf(scenes, HUB_SAMPLES).filter((item) => item !== cover);
  return { album, items, scenes, cover, samples, counts: countsOf(items) };
};

const sumCounts = (albums: readonly HubAlbum[]): AlbumCounts => ({
  photos: albums.reduce((sum, entry) => sum + entry.counts.photos, 0),
  videos: albums.reduce((sum, entry) => sum + entry.counts.videos, 0),
});

const byEntryDateDescending = (left: HubAlbum, right: HubAlbum): number =>
  (right.album.entryDate ?? '').localeCompare(left.album.entryDate ?? '');

export const FREE_SECTION_ID = 'ohne-session';

export const hubSectionsOf = (
  sessions: readonly LabSession[],
  albums: readonly HubAlbum[],
): HubSection[] => {
  const sessionSections = sessions.flatMap((session) => {
    const own = albums
      .filter((entry) => entry.album.sessionId === session.id)
      .sort(byEntryDateDescending);
    return own.length === 0
      ? []
      : [{ id: session.id, session, albums: own, counts: sumCounts(own) }];
  });
  const free = albums.filter((entry) => entry.album.sessionId === null).sort(byEntryDateDescending);
  const freeSections =
    free.length === 0
      ? []
      : [{ id: FREE_SECTION_ID, session: null, albums: free, counts: sumCounts(free) }];
  return [...sessionSections, ...freeSections];
};

export interface RailScene {
  id: string;
  hour: string | null;
  time: string;
}

export const railScenesOf = <TFrame extends SceneFrame>(
  scenes: readonly GalleryScene<TFrame>[],
): RailScene[] =>
  scenes.map((scene, index) => {
    const hour = hourLabel(scene.startsAt);
    const previousHour = index === 0 ? null : hourLabel(scenes[index - 1]?.startsAt ?? null);
    return {
      id: `szene-${scene.index}`,
      hour: hour !== null && hour !== previousHour ? hour : null,
      time: clockLabel(scene.startsAt) || `${scene.firstNumber}`,
    };
  });

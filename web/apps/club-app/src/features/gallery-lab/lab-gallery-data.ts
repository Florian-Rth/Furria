import type { LabPhotoScene, LabPhotoSpec } from './lab-photo';
import { labPhotoSourceOf } from './lab-photo';

export interface LabAct {
  scene: LabPhotoScene;
  frames: number;
  videos?: number;
}

export interface LabAlbumSpec {
  id: string;
  title: string;
  sessionId: string | null;
  entryDate: string | null;
  startsAt: string | null;
  seed: number;
  acts: readonly LabAct[];
  uploaders: readonly string[];
  camera: string;
  selection: number;
  published: boolean;
}

export interface LabSession {
  id: string;
  label: string;
}

export interface LabItem {
  id: number;
  number: number;
  capturedAt: string | null;
  kind: 'photo' | 'video';
  duration: string | null;
  photo: LabPhotoSpec;
  portrait: boolean;
  uploader: string;
  camera: string;
  selection: number | null;
}

export const LAB_SESSIONS: readonly LabSession[] = [
  { id: '2025', label: '2025/26' },
  { id: '2024', label: '2024/25' },
  { id: '1985', label: '1985/86' },
];

const GALA: readonly LabAct[] = [
  { scene: 'crowd', frames: 34 },
  { scene: 'stage', frames: 64, videos: 1 },
  { scene: 'garde', frames: 112, videos: 2 },
  { scene: 'stage', frames: 38 },
  { scene: 'garde', frames: 46, videos: 1 },
  { scene: 'crowd', frames: 28 },
  { scene: 'bar', frames: 42 },
  { scene: 'stage', frames: 80, videos: 2 },
  { scene: 'garde', frames: 96, videos: 1 },
  { scene: 'stage', frames: 52 },
  { scene: 'garde', frames: 71, videos: 2 },
  { scene: 'crowd', frames: 36 },
  { scene: 'stage', frames: 90, videos: 2 },
  { scene: 'bar', frames: 58 },
];

const KIDS: readonly LabAct[] = [
  { scene: 'crowd', frames: 22 },
  { scene: 'garde', frames: 88, videos: 1 },
  { scene: 'stage', frames: 64 },
  { scene: 'garde', frames: 102, videos: 1 },
  { scene: 'crowd', frames: 30 },
  { scene: 'stage', frames: 70, videos: 1 },
  { scene: 'garde', frames: 36 },
];

const PARADE: readonly LabAct[] = [
  { scene: 'parade', frames: 140, videos: 4 },
  { scene: 'crowd', frames: 60 },
  { scene: 'parade', frames: 320, videos: 6 },
  { scene: 'parade', frames: 260, videos: 5 },
  { scene: 'crowd', frames: 94 },
  { scene: 'parade', frames: 210, videos: 4 },
  { scene: 'bar', frames: 120, videos: 2 },
];

const SMALL: readonly LabAct[] = [
  { scene: 'stage', frames: 48 },
  { scene: 'crowd', frames: 40, videos: 1 },
  { scene: 'bar', frames: 62, videos: 1 },
  { scene: 'garde', frames: 36 },
];

const ARCHIVE: readonly LabAct[] = [{ scene: 'archive', frames: 148 }];

const SUMMER: readonly LabAct[] = [
  { scene: 'parade', frames: 70 },
  { scene: 'bar', frames: 90, videos: 2 },
  { scene: 'crowd', frames: 52 },
];

const KURZ = 'Markus Kurz';
const KOENIG = 'Anna König';
const BRAUN = 'Jens Braun';

export const LAB_ALBUMS: readonly LabAlbumSpec[] = [
  {
    id: 'prunksitzung-2026',
    title: 'Prunksitzung 2026',
    sessionId: '2025',
    entryDate: '2026-02-14',
    startsAt: '2026-02-14T19:11:04',
    seed: 11,
    acts: GALA,
    uploaders: [KURZ, KOENIG],
    camera: 'Canon EOS R6',
    selection: 12,
    published: true,
  },
  {
    id: 'rosenmontagsumzug-2026',
    title: 'Rosenmontagsumzug',
    sessionId: '2025',
    entryDate: '2026-02-16',
    startsAt: '2026-02-16T13:02:40',
    seed: 23,
    acts: PARADE,
    uploaders: [KURZ, BRAUN],
    camera: 'Sony α7 IV',
    selection: 12,
    published: true,
  },
  {
    id: 'kinderprunksitzung-2026',
    title: 'Kinderprunksitzung',
    sessionId: '2025',
    entryDate: '2026-02-08',
    startsAt: '2026-02-08T14:31:12',
    seed: 37,
    acts: KIDS,
    uploaders: [KOENIG],
    camera: 'Canon EOS R6',
    selection: 7,
    published: false,
  },
  {
    id: 'ordensfest-2026',
    title: 'Ordensfest',
    sessionId: '2025',
    entryDate: '2026-01-24',
    startsAt: '2026-01-24T19:45:00',
    seed: 41,
    acts: SMALL,
    uploaders: [BRAUN],
    camera: 'iPhone 15 Pro',
    selection: 0,
    published: false,
  },
  {
    id: 'sessionseroeffnung-2025',
    title: 'Sessionseröffnung 11.11.',
    sessionId: '2025',
    entryDate: '2025-11-11',
    startsAt: '2025-11-11T11:00:30',
    seed: 53,
    acts: SMALL,
    uploaders: [KURZ],
    camera: 'Canon EOS R6',
    selection: 11,
    published: true,
  },
  {
    id: 'prunksitzung-2025',
    title: 'Prunksitzung 2025',
    sessionId: '2024',
    entryDate: '2025-03-01',
    startsAt: '2025-03-01T19:09:00',
    seed: 61,
    acts: GALA,
    uploaders: [KURZ],
    camera: 'Canon EOS R6',
    selection: 12,
    published: true,
  },
  {
    id: 'umzug-2025',
    title: 'Rosenmontagsumzug',
    sessionId: '2024',
    entryDate: '2025-03-03',
    startsAt: '2025-03-03T13:10:00',
    seed: 71,
    acts: PARADE,
    uploaders: [BRAUN],
    camera: 'Sony α7 IV',
    selection: 12,
    published: true,
  },
  {
    id: 'kinderprunk-2025',
    title: 'Kinderprunksitzung',
    sessionId: '2024',
    entryDate: '2025-02-23',
    startsAt: '2025-02-23T14:30:00',
    seed: 83,
    acts: KIDS,
    uploaders: [KOENIG],
    camera: 'Canon EOS R6',
    selection: 9,
    published: true,
  },
  {
    id: 'archiv-1985',
    title: 'Archiv Session 1985',
    sessionId: '1985',
    entryDate: null,
    startsAt: null,
    seed: 97,
    acts: ARCHIVE,
    uploaders: [BRAUN],
    camera: 'Scan',
    selection: 12,
    published: true,
  },
  {
    id: 'sommerfest-2026',
    title: 'Sommerfest am Bootshaus',
    sessionId: null,
    entryDate: '2026-07-11',
    startsAt: '2026-07-11T15:20:00',
    seed: 101,
    acts: SUMMER,
    uploaders: [KOENIG],
    camera: 'iPhone 15 Pro',
    selection: 0,
    published: false,
  },
  {
    id: 'vereinsheim-2026',
    title: 'Vereinsheim-Renovierung',
    sessionId: null,
    entryDate: null,
    startsAt: '2026-05-02T09:30:00',
    seed: 113,
    acts: [{ scene: 'bar', frames: 64 }],
    uploaders: [BRAUN],
    camera: 'iPhone 15 Pro',
    selection: 0,
    published: false,
  },
];

export const LAB_INBOX_ALBUM: LabAlbumSpec = {
  id: 'eingang',
  title: 'Herbstfest',
  sessionId: null,
  entryDate: '2026-10-03',
  startsAt: '2026-10-03T19:02:10',
  seed: 131,
  acts: [
    { scene: 'crowd', frames: 18 },
    { scene: 'stage', frames: 40 },
    { scene: 'garde', frames: 52 },
    { scene: 'bar', frames: 26 },
    { scene: 'stage', frames: 34 },
  ],
  uploaders: [KOENIG],
  camera: 'Canon EOS R6',
  selection: 0,
  published: false,
};

const BURST_SECONDS = [1, 1, 2, 3, 4, 6, 9, 14, 21] as const;
const ACT_GAP_SECONDS = 140;
const SECONDS_IN_MS = 1000;
const IMAGE_VARIETY = 29;
const VIDEO_SECONDS = [14, 23, 41, 58, 72, 96] as const;

const cyclicPick = <TItem>(items: readonly TItem[], index: number): TItem =>
  items[index % items.length] as TItem;

const clockOf = (start: number, offsetSeconds: number): string =>
  new Date(start + offsetSeconds * SECONDS_IN_MS).toISOString().slice(0, 19);

const durationOf = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export const labItemsOf = (album: LabAlbumSpec): LabItem[] => {
  const start = album.startsAt === null ? null : Date.parse(`${album.startsAt}Z`);
  const items: LabItem[] = [];
  let offset = 0;

  album.acts.forEach((act, actIndex) => {
    const videoEvery = act.videos === undefined ? 0 : Math.floor(act.frames / (act.videos + 1));
    for (let frame = 0; frame < act.frames; frame += 1) {
      const position = items.length;
      const isVideo = videoEvery > 0 && frame > 0 && frame % videoEvery === 0;
      offset += frame === 0 ? 0 : cyclicPick(BURST_SECONDS, position * 7 + actIndex);
      const portrait = (position * 5 + actIndex) % 7 === 0;
      items.push({
        id: album.seed * 10_000 + position,
        number: position + 1,
        capturedAt: start === null ? null : clockOf(start, offset),
        kind: isVideo ? 'video' : 'photo',
        duration: isVideo ? durationOf(cyclicPick(VIDEO_SECONDS, position)) : null,
        photo: {
          seed: album.seed * 131 + actIndex * 977 + (frame % IMAGE_VARIETY) * 31,
          scene: act.scene,
          portrait,
        },
        portrait,
        uploader: cyclicPick(album.uploaders, Math.floor(position / 90)),
        camera: album.camera,
        selection: null,
      });
    }
    offset += ACT_GAP_SECONDS + actIndex * 17;
  });

  const stride = Math.max(Math.floor(items.length / (album.selection + 1)), 1);
  for (let order = 1; order <= album.selection; order += 1) {
    const chosen = items.slice(order * stride).find((item) => item.kind === 'photo');
    if (chosen !== undefined) {
      chosen.selection = order;
    }
  }

  return items;
};

export const labAlbumOf = (id: string): LabAlbumSpec | null =>
  LAB_ALBUMS.find((album) => album.id === id) ?? null;

const sourceCache = new Map<string, string>();

export const labSourceOf = (photo: LabPhotoSpec): string => {
  const key = `${photo.scene}-${photo.seed}-${photo.portrait}`;
  const cached = sourceCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const source = labPhotoSourceOf(photo);
  sourceCache.set(key, source);
  return source;
};

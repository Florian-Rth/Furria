import type { KkStudioCLaneLabel } from '@furria/ui/studio-c-types';

export const STUDIO_C_TITLE_FALLBACK = 'Auftritt üben';
export const STUDIO_C_LOADING_TITLE = 'Auftritt lädt';
export const STUDIO_C_LOCKED_TITLE = 'Nur für die Besetzung';
export const STUDIO_C_LOCKED_LINE = 'Musik, Video und Bühne sieht, wer in diesem Auftritt tanzt.';
export const STUDIO_C_NO_MUSIC_TITLE = 'Noch keine Musik';
export const STUDIO_C_NO_MUSIC_LINE =
  'Sobald die Musik da ist, laufen hier Schritte, Video und Bühne mit.';
export const STUDIO_C_MUSIC_FAILED = 'Die Musik lädt nicht. Seite neu laden.';
export const STUDIO_C_EDIT_LATER =
  'Bilder setzen, Wege ziehen und Video verschieben kommt noch – direkt hier auf den Zeilen.';

export const STUDIO_C_VIEW_LABEL = 'Bühne und Video';
export const STUDIO_C_STAGE_LABEL = 'Bühne von vorne, dein Platz rot';
export const STUDIO_C_VIDEO_LABEL = 'Trainervideo';
export const STUDIO_C_SWAP_TO_VIDEO = 'Video groß zeigen';
export const STUDIO_C_SWAP_TO_STAGE = 'Bühne groß zeigen';
export const STUDIO_C_INSET_STAGE = 'Bühne';
export const STUDIO_C_INSET_MIRRORED = 'Gespiegelt';
export const STUDIO_C_INSET_PLAIN = 'Video';
export const STUDIO_C_NO_VIDEO = 'Kein Video an dieser Stelle';

export const STUDIO_C_TRANSPORT_LABEL = 'Wiedergabe';
export const STUDIO_C_PLAY = 'Abspielen';
export const STUDIO_C_PAUSE = 'Anhalten';
export const STUDIO_C_LOADING_MUSIC = 'Musik lädt';
export const STUDIO_C_CLOCK_LABEL = 'Stelle in der Musik';
export const STUDIO_C_LOOP_ON = 'Schritt wiederholen';
export const STUDIO_C_LOOP_OFF = 'Wiederholen beenden';
export const STUDIO_C_LOOP_TEXT = 'Wiederholen';
export const STUDIO_C_MIRROR_LABEL = 'Video gespiegelt';
export const STUDIO_C_MIRROR_TEXT = 'Gespiegelt';
export const STUDIO_C_RATE_CAPTION = 'Tempo';
export const STUDIO_C_SLOWER = 'Langsamer';
export const STUDIO_C_FASTER = 'Schneller';

export const STUDIO_C_TIMELINE_LABEL = 'Ablauf der Musik, ziehen zum Spulen';
export const STUDIO_C_NO_STEP = 'Kein Schritt';
export const STUDIO_C_NO_STEP_META = 'Vor oder nach den Schritten';
export const STUDIO_C_NONE = 'keine';

export const studioCLaneLabelsOf = (
  hasVideos: boolean,
  hasFormations: boolean,
  hasOwnSpot: boolean,
): KkStudioCLaneLabel[] => [
  { kind: 'part', label: 'Teil', note: null },
  { kind: 'step', label: 'Schritt', note: null },
  { kind: 'count', label: 'Zählen', note: null },
  { kind: 'wave', label: 'Musik', note: null },
  { kind: 'video', label: 'Video', note: hasVideos ? null : STUDIO_C_NONE },
  { kind: 'formation', label: 'Bilder', note: hasFormations ? null : STUDIO_C_NONE },
  { kind: 'own', label: 'Du', note: hasOwnSpot ? null : STUDIO_C_NONE },
];

export const eightLabelOf = (eight: number | null): string =>
  eight === null ? 'Auftakt' : `Achter ${eight + 1}`;

export const stepPositionOf = (index: number, total: number): string => `${index + 1}/${total}`;

export const stepMetaOf = (partName: string | null, range: string): string =>
  partName === null ? range : `${partName} · ${range}`;

export const loopBlockLabelOf = (name: string, looped: boolean): string =>
  looped ? `${name} nicht mehr wiederholen` : `${name} wiederholen`;

export const totalClockOf = (total: string): string => `von ${total}`;

import type { OwnCue } from './studio-e-way';

export const STUDIO_E_FALLBACK_TITLE = 'Auftritt üben';
export const STUDIO_E_LABEL = 'Üben';
export const STUDIO_E_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const STUDIO_E_NO_ACCESS = 'Üben ist für die Besetzung und das Training dieses Auftritts.';
export const STUDIO_E_NO_STEPS = 'Noch keine Schritte';
export const STUDIO_E_LOAD_FAILED = 'Die Musik lädt gerade nicht. Versuch es gleich noch einmal.';
export const STUDIO_E_LOADING = 'Die Musik lädt …';
export const STUDIO_E_STAGE_LABEL = 'Bühne aus deiner Sicht, das Publikum oben';
export const STUDIO_E_FRONT = 'Publikum';
export const STUDIO_E_TRANSPORT_LABEL = 'Abspielen und üben';
export const STUDIO_E_PROGRESS_LABEL = 'Zu einem Schritt springen';
export const STUDIO_E_PLAY = 'Abspielen';
export const STUDIO_E_PAUSE = 'Anhalten';
export const STUDIO_E_BACK = 'Zum Anfang des Schritts';
export const STUDIO_E_FORWARD = 'Nächster Schritt';
export const STUDIO_E_LOOP = 'Schritt wiederholen';
export const STUDIO_E_VIDEO = 'Video';
export const STUDIO_E_VIDEO_TITLE = 'Trainervideo';
export const STUDIO_E_MIRRORED = 'Gespiegelt';
export const STUDIO_E_CLOSE = 'Video schließen';
export const STUDIO_E_NO_VIDEO = 'Für diesen Teil gibt es kein Video.';
export const STUDIO_E_NOW = 'jetzt';

export const countLabelOf = (count: number | null): string =>
  count === null ? 'Keine Zählzeit' : `Zählzeit ${count} von 8`;

export const rateTextOf = (percent: number): string => `${percent} %`;

export const rateLabelOf = (percent: number): string => `Tempo ${percent} %`;

export const cueTextOf = (cue: OwnCue): string =>
  cue.tone === 'now' ? STUDIO_E_NOW : `in ${cue.counts}`;

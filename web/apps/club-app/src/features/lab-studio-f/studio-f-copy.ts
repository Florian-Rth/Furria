export const STUDIO_F_FALLBACK_TITLE = 'Auftritt üben';
export const STUDIO_F_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const STUDIO_F_NO_ACCESS = 'Üben ist für die Besetzung und das Training dieses Auftritts.';
export const STUDIO_F_LESSON_LABEL = 'Schritt für Schritt üben';
export const STUDIO_F_PROGRESS_LABEL = 'Alle Schritte';
export const STUDIO_F_FRAME_LABEL = 'Wische für den nächsten oder vorherigen Schritt';
export const STUDIO_F_VIEW_LABEL = 'Ansicht';
export const STUDIO_F_VIEW_VIDEO = 'Video';
export const STUDIO_F_VIEW_STAGE = 'Bühne';
export const STUDIO_F_MIRRORED = 'Gespiegelt';
export const STUDIO_F_VIDEO_LABEL = 'Trainervideo';
export const STUDIO_F_STAGE_LABEL = 'Bühne mit deinem Platz';
export const STUDIO_F_FRONT = 'Publikum';
export const STUDIO_F_COUNT_LABEL = 'Zählzeit';
export const STUDIO_F_NO_DESCRIPTION = 'Zu diesem Schritt gibt es keine Beschreibung.';
export const STUDIO_F_MUSIC_FAILED = 'Die Musik konnte nicht geladen werden.';
export const STUDIO_F_OPEN_DESCRIPTION = 'Beschreibung ganz lesen';
export const STUDIO_F_SPEED_LABEL = 'Tempo';
export const STUDIO_F_WHOLE = 'Ganzer Tanz';
export const STUDIO_F_PLAY = 'Abspielen';
export const STUDIO_F_PAUSE = 'Pause';
export const STUDIO_F_PREVIOUS = 'Vorheriger Schritt';
export const STUDIO_F_NEXT = 'Nächster Schritt';
export const STUDIO_F_NO_STEPS = 'Noch keine Schritte';
export const STUDIO_F_NO_STEPS_LINE =
  'Sobald das Training Schritte anlegt, übst du sie hier einzeln.';
export const STUDIO_F_SHEET_LABEL = 'Schritt';
export const STUDIO_F_SHEET_CLOSE = 'Schließen';

export const studioFRateLabelOf = (id: string): string => `${id} %`;

export const studioFSegmentLabelOf = (number: number, name: string): string =>
  `Schritt ${number}: ${name}`;

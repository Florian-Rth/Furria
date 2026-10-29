export const STUDIO_D_FALLBACK_TITLE = 'Auftritt üben';
export const STUDIO_D_PLAYER_LABEL = 'Üben';
export const STUDIO_D_CLOSE = 'Schließen';
export const STUDIO_D_VIDEO_LABEL = 'Trainervideo';
export const STUDIO_D_STAGE_LABEL = 'Bühne mit der Formation im Takt der Musik';
export const STUDIO_D_SHOW_STAGE = 'Bühne groß zeigen';
export const STUDIO_D_SHOW_VIDEO = 'Trainervideo groß zeigen';
export const STUDIO_D_PLAY = 'Abspielen';
export const STUDIO_D_PAUSE = 'Anhalten';
export const STUDIO_D_LOOP_STEP = 'Schritt wiederholen';
export const STUDIO_D_MIRRORED = 'Gespiegelt';
export const STUDIO_D_TEMPO = 'Tempo';
export const STUDIO_D_SEEK = 'Musik – tippen, um zu springen';
export const STUDIO_D_STEPS = 'Schritte';
export const STUDIO_D_ALL_STEPS = 'Alle Schritte zeigen';
export const STUDIO_D_LOOSE = 'Weitere Schritte';
export const STUDIO_D_NO_STEPS = 'Noch keine Schritte';
export const STUDIO_D_LOAD_FAILED = 'Die Musik lädt gerade nicht.';
export const STUDIO_D_NO_ACCESS = 'Üben ist für die Besetzung und das Training dieses Auftritts.';
export const STUDIO_D_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';

export const countLabelOf = (count: number | null): string =>
  count === null ? 'Keine Zählzeit' : `Zählzeit ${count}`;

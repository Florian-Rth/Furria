export const WAY_LABEL = 'Üben zu Hause';
export const WAY_RIBBON_LABEL = 'Schritte und Achter';
export const WAY_RIBBON_EMPTY = 'Noch keine Schritte auf der Musik';
export const WAY_NOTE_EMPTY = 'Zu diesem Schritt steht noch keine Beschreibung.';
export const WAY_NOTHING_YET =
  'Noch keine Musik und keine Schritte. Sobald sie da sind, übst du hier.';
export const WAY_NO_MUSIC_EYEBROW = 'Noch nichts zum Üben';
export const WAY_NOTE_CLOSE = 'Schließen';
export const WAY_NEAR_LABEL = 'Ganze Bühne zeigen';
export const WAY_WHOLE_LABEL = 'Bühne nah an deinem Platz zeigen';
export const WAY_VIDEO_SMALL_LABEL = 'Trainervideo groß zeigen, ziehen zum Verschieben';
export const WAY_VIDEO_LARGE_LABEL = 'Trainervideo klein zeigen, ziehen zum Verschieben';
export const WAY_MIRROR_ON_LABEL = 'Video gespiegelt, tippen für ungespiegelt';
export const WAY_MIRROR_OFF_LABEL = 'Video ungespiegelt, tippen zum Spiegeln';
export const WAY_LOOP_STEP_LABEL = 'Schritt wiederholen';
export const WAY_LOOP_STEP_OFF_LABEL = 'Schritt nicht mehr wiederholen';
export const WAY_LOOP_PART_OFF_LABEL = 'Teil nicht mehr wiederholen';

export const wayEyebrowOf = (part: string | null, number: number, total: number): string =>
  part === null ? `Schritt ${number} von ${total}` : `${part} · ${number} von ${total}`;

export const wayNoteLabelOf = (text: string): string => `${text} Ganz lesen.`;

export const wayTileLabelOf = (name: string, eights: number): string =>
  `${name}, ${eights} × 8: dorthin springen`;

export const wayNoVideoEyebrowOf = (part: string | null): string =>
  part === null ? 'Ohne Video' : `${part} · ohne Video`;

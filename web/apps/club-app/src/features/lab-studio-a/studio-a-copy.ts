import type { StudioALength } from './studio-a-practice';

export const STUDIO_A_FALLBACK_TITLE = 'Auftritt üben';
export const STUDIO_A_VIDEO_LABEL = 'Trainervideo';
export const STUDIO_A_MIRRORED = 'Gespiegelt';
export const STUDIO_A_NO_VIDEO = 'Für diesen Teil gibt es kein Video';
export const STUDIO_A_STAGE_LABEL = 'Bühne mit der Formation im Takt der Musik';
export const STUDIO_A_FRONT = 'Publikum';
export const STUDIO_A_MUSIC_LABEL = 'Musik – tippen oder ziehen, um zu springen';
export const STUDIO_A_LENS_LABEL = 'Zählzeiten rund um die aktuelle Stelle';
export const STUDIO_A_DECK_LABEL = 'Abspielen und üben';
export const STUDIO_A_PLAY = 'Abspielen';
export const STUDIO_A_PAUSE = 'Anhalten';
export const STUDIO_A_LOOP_STEP = 'Schritt wiederholen';
export const STUDIO_A_LOOP_PART = 'Teil';
export const STUDIO_A_LOOP_PART_FULL = 'Teil wiederholen';
export const STUDIO_A_LOOP_ACTION = 'Wiederholen';
export const STUDIO_A_TEMPO = 'Tempo';
export const STUDIO_A_MANUAL_LABEL = 'Schritte';
export const STUDIO_A_LOOSE = 'Ohne Teil';
export const STUDIO_A_CUT_AWAY = 'Nicht in der Musik';
export const STUDIO_A_CUT_AWAY_FACTS = 'Fehlt in der Musik';
export const STUDIO_A_NO_STEPS = 'Noch keine Schritte';
export const STUDIO_A_NO_COUNT = 'Keine Zählzeit';
export const STUDIO_A_LOAD_FAILED = 'Die Musik lädt gerade nicht.';
export const STUDIO_A_NO_ACCESS = 'Üben ist für die Besetzung und das Training dieses Auftritts.';
export const STUDIO_A_EDIT_LATER = 'Musik, Schritte und Bühne bearbeiten – kommt noch.';
export const STUDIO_A_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const STUDIO_A_RATES = [0.5, 0.6, 0.7, 0.8, 0.9, 1] as const;

export const ownTagOf = (number: number): string => `Dein Platz ${number}`;

export const openTagOf = (count: number): string =>
  count === 1 ? '1 Platz offen' : `${count} Plätze offen`;

export const countLabelOf = (count: number | null): string =>
  count === null ? STUDIO_A_NO_COUNT : `Zählzeit ${count}`;

export const partLoopLabelOf = (name: string): string => `${name} wiederholen`;

export const stepActionOf = (number: number, name: string): string =>
  `Schritt ${number} ${name} wiederholen`;

export const lengthTextOf = (length: StudioALength | null): string | null => {
  if (length === null) {
    return null;
  }

  switch (length.kind) {
    case 'eights':
      return `${length.eights}×8`;
    case 'counts':
      return `${length.counts} Zählzeiten`;
    case 'seconds':
      return `${Math.round(length.seconds)} s`;
  }
};

export const partMetaOf = (span: string | null, steps: number, withVideo: boolean): string =>
  [span, steps === 1 ? '1 Schritt' : `${steps} Schritte`, withVideo ? 'mit Video' : 'ohne Video']
    .filter((fact) => fact !== null)
    .join(' · ');

export const stepOfLabel = (number: number, total: number): string => `Schritt ${number}/${total}`;

export const eightLabelOf = (eight: number | null, eights: number | null): string | null =>
  eight === null || eights === null ? null : `Achter ${eight}/${eights}`;

export const factsOf = (facts: readonly (string | null)[]): string =>
  facts.filter((fact) => fact !== null && fact !== '').join(' · ');

export const rateNameOf = (rate: number): string => `${Math.round(rate * 100)} Prozent`;

export const rateLabelOf = (rate: number): string => String(Math.round(rate * 100));

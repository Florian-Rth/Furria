import type { KkKeyListEntry } from '@furria/ui/KkKeyList';
import type { StageSummary } from './practice-stage';
import { clockOf } from './practice-step-list';
import type { OwnCue } from './practice-way';

export const PRACTICE_FALLBACK_TITLE = 'Auftritt üben';
export const PRACTICE_LABEL = 'Üben';
export const PRACTICE_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const PRACTICE_NO_ACCESS = 'Üben ist für die Besetzung und das Training dieses Auftritts.';
export const PRACTICE_NO_STEPS = 'Noch keine Schritte';
export const PRACTICE_LOAD_FAILED = 'Die Musik lädt gerade nicht. Versuch es gleich noch einmal.';
export const PRACTICE_STAGE_LABEL = 'Bühne aus deiner Sicht, das Publikum oben';
export const PRACTICE_FRONT = 'Publikum';
export const PRACTICE_SEGMENTS_LABEL = 'Schritte';
export const PRACTICE_PLAY = 'Abspielen';
export const PRACTICE_PAUSE = 'Anhalten';
export const PRACTICE_BACK = 'Zum Anfang des Schritts';
export const PRACTICE_FORWARD = 'Nächster Schritt';
export const PRACTICE_VIDEO_TITLE = 'Trainervideo';
export const PRACTICE_MIRRORED = 'Gespiegelt';
export const PRACTICE_NO_VIDEO = 'ohne Video';
export const PRACTICE_NOW = 'jetzt';
export const PRACTICE_RUNNING = 'Läuft';
export const PRACTICE_PAUSED = 'Pause';
export const PRACTICE_STEP_BACK = 'Schritt zurück';
export const PRACTICE_STEP_FORWARD = 'Schritt vor';

export const PRACTICE_HINT_TAP = 'Einmal tippen: Start und Pause · hoch oder runter wischen: Tempo';
export const PRACTICE_HINT_SIDES = 'Zweimal links oder rechts tippen: Schritt zurück oder vor';

export const countLabelOf = (count: number | null): string =>
  count === null ? 'Keine Zählzeit' : `Zählzeit ${count} von 8`;

export const rateTextOf = (percent: number): string => `${percent} %`;

export const rateLabelOf = (percent: number): string => `Tempo ${percent} %, tippen für langsamer`;

export const cueTextOf = (cue: OwnCue): string =>
  cue.tone === 'now' ? PRACTICE_NOW : `in ${cue.counts}`;

export const partLoopLabelOf = (name: string): string => `Teil „${name}“ wiederholen`;

const spotListOf = (numbers: readonly number[]): string => {
  const shown = numbers.map(String);
  const last = shown.pop();

  return shown.length === 0 ? (last ?? '') : `${shown.join(', ')} und ${last}`;
};

export const openSpotsTextOf = (open: readonly number[]): string | null => {
  if (open.length === 0) {
    return null;
  }

  return open.length === 1 ? `Platz ${open[0]} frei` : `Plätze ${spotListOf(open)} frei`;
};

export const practiceStageLabelOf = (summary: StageSummary): string =>
  [
    PRACTICE_STAGE_LABEL,
    summary.own === null ? null : `Du stehst auf Platz ${summary.own}`,
    openSpotsTextOf(summary.open),
  ]
    .filter((part) => part !== null)
    .join('. ');

export const PRACTICE_KEYS_TITLE = 'Tastatur';
export const PRACTICE_KEYS: readonly KkKeyListEntry[] = [
  { id: 'toggle', keys: ['Leertaste'], action: 'Abspielen oder anhalten' },
  { id: 'step', keys: ['←', '→'], action: 'Schritt zurück oder vor' },
  { id: 'tempo', keys: ['↑', '↓'], action: 'Schneller oder langsamer' },
  { id: 'loop', keys: ['L'], action: 'Schritt wiederholen' },
];

export const PRACTICE_TRAINING_START = 'Training starten';
export const PRACTICE_LARGE_KEYS_LABEL = 'Schritte und Tempo';
export const PRACTICE_VIDEO_SHOW = 'Video';
export const PRACTICE_VIDEO_SHOW_LABEL = 'Trainervideo statt Bühne zeigen';
export const PRACTICE_TEMPO = 'Tempo';

export const noVideoEyebrowOf = (part: string | null): string =>
  part === null ? PRACTICE_NO_VIDEO : `${part} · ${PRACTICE_NO_VIDEO}`;

export const PRACTICE_STEPS_TITLE = 'Schritte';
export const PRACTICE_STEPS_OPEN = 'Alle Schritte zeigen';
export const PRACTICE_STEPS_CLOSE = 'Schritte schließen';
export const PRACTICE_STEPS_FILMED = 'Mit Trainervideo';
export const PRACTICE_NO_PART = 'Ohne Teil';

const spanOf = (start: number, end: number): string => `${clockOf(start)}–${clockOf(end)}`;

export const stepsGroupMetaOf = (start: number, end: number, count: number): string =>
  `${spanOf(start, end)} · ${count} ${count === 1 ? 'Schritt' : 'Schritte'}`;

export const stepsRowMetaOf = (start: number, end: number, eights: number | null): string =>
  eights === null
    ? spanOf(start, end)
    : `${spanOf(start, end)} · ${String(eights).replace('.', ',')} × 8`;

export const stepsRowLabelOf = (name: string): string => `${name}: dorthin springen`;

export const stepsLoopLabelOf = (name: string): string => `${name} wiederholen`;

export const takeTextOf = (index: number, count: number): string => `${index + 1}/${count}`;

export const takeLabelOf = (index: number, count: number): string =>
  `Aufnahme ${takeTextOf(index, count)}, tippen für die nächste`;

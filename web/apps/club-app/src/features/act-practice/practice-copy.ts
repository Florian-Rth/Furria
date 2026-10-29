import type { LoopKind } from './practice-controls';
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
export const PRACTICE_TRANSPORT_LABEL = 'Abspielen und üben';
export const PRACTICE_SEGMENTS_LABEL = 'Schritte';
export const PRACTICE_PLAY = 'Abspielen';
export const PRACTICE_PAUSE = 'Anhalten';
export const PRACTICE_BACK = 'Zum Anfang des Schritts';
export const PRACTICE_FORWARD = 'Nächster Schritt';
export const PRACTICE_VIDEO_TITLE = 'Trainervideo';
export const PRACTICE_SIDE_LABEL = 'Deine Bühne';
export const PRACTICE_MIRRORED = 'Gespiegelt';
export const PRACTICE_NO_VIDEO = 'ohne Video';
export const PRACTICE_NO_VIDEO_NOTE = 'Folge deinem Weg auf der Bühne.';
export const PRACTICE_NOW = 'jetzt';
export const PRACTICE_RUNNING = 'Läuft';
export const PRACTICE_PAUSED = 'Pause';
export const PRACTICE_STEP_BACK = 'Schritt zurück';
export const PRACTICE_STEP_FORWARD = 'Schritt vor';

export const PRACTICE_HINT_TAP = 'Tippen: Start und Pause · hoch oder runter wischen: Tempo';
export const PRACTICE_HINT_SIDES = 'Doppelt links oder rechts oder zur Seite wischen: Schritt';

export const countLabelOf = (count: number | null): string =>
  count === null ? 'Keine Zählzeit' : `Zählzeit ${count} von 8`;

export const rateTextOf = (percent: number): string => `${percent} %`;

export const rateLabelOf = (percent: number): string => `Tempo ${percent} %, tippen für langsamer`;

export const cueTextOf = (cue: OwnCue): string =>
  cue.tone === 'now' ? PRACTICE_NOW : `in ${cue.counts}`;

export const segmentLabelOf = (name: string): string => `${name}: springen oder wiederholen`;

export const noVideoEyebrowOf = (part: string | null): string =>
  part === null ? PRACTICE_NO_VIDEO : `${part} · ${PRACTICE_NO_VIDEO}`;

export const barStatusOf = (kind: LoopKind, part: string | null): string => {
  if (kind === 'step') {
    return 'Schritt wird wiederholt · nochmal tippen spielt weiter';
  }
  if (kind === 'part') {
    return `${part ?? 'Teil'} wird wiederholt · nochmal halten spielt weiter`;
  }

  return 'Schritt antippen: wiederholen · halten: ganzer Teil';
};

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

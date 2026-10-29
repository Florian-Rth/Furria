import type { LoopKind } from './studio-e-controls';
import { clockOf } from './studio-e-steps';
import type { OwnCue } from './studio-e-way';

export const STUDIO_E_FALLBACK_TITLE = 'Auftritt üben';
export const STUDIO_E_LABEL = 'Üben';
export const STUDIO_E_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const STUDIO_E_NO_ACCESS = 'Üben ist für die Besetzung und das Training dieses Auftritts.';
export const STUDIO_E_NO_STEPS = 'Noch keine Schritte';
export const STUDIO_E_LOAD_FAILED = 'Die Musik lädt gerade nicht. Versuch es gleich noch einmal.';
export const STUDIO_E_STAGE_LABEL = 'Bühne aus deiner Sicht, das Publikum oben';
export const STUDIO_E_FRONT = 'Publikum';
export const STUDIO_E_TRANSPORT_LABEL = 'Abspielen und üben';
export const STUDIO_E_SEGMENTS_LABEL = 'Schritte';
export const STUDIO_E_PLAY = 'Abspielen';
export const STUDIO_E_PAUSE = 'Anhalten';
export const STUDIO_E_BACK = 'Zum Anfang des Schritts';
export const STUDIO_E_FORWARD = 'Nächster Schritt';
export const STUDIO_E_VIDEO_TITLE = 'Trainervideo';
export const STUDIO_E_SIDE_LABEL = 'Deine Bühne';
export const STUDIO_E_MIRRORED = 'Gespiegelt';
export const STUDIO_E_NO_VIDEO = 'ohne Video';
export const STUDIO_E_NO_VIDEO_NOTE = 'Folge deinem Weg auf der Bühne.';
export const STUDIO_E_NOW = 'jetzt';
export const STUDIO_E_RUNNING = 'Läuft';
export const STUDIO_E_PAUSED = 'Pause';
export const STUDIO_E_STEP_BACK = 'Schritt zurück';
export const STUDIO_E_STEP_FORWARD = 'Schritt vor';

export const STUDIO_E_HINT_TAP = 'Tippen: Start und Pause · hoch oder runter wischen: Tempo';
export const STUDIO_E_HINT_SIDES = 'Doppelt links oder rechts oder zur Seite wischen: Schritt';

export const countLabelOf = (count: number | null): string =>
  count === null ? 'Keine Zählzeit' : `Zählzeit ${count} von 8`;

export const rateTextOf = (percent: number): string => `${percent} %`;

export const rateLabelOf = (percent: number): string => `Tempo ${percent} %, tippen für langsamer`;

export const cueTextOf = (cue: OwnCue): string =>
  cue.tone === 'now' ? STUDIO_E_NOW : `in ${cue.counts}`;

export const segmentLabelOf = (name: string): string => `${name}: springen oder wiederholen`;

export const noVideoEyebrowOf = (part: string | null): string =>
  part === null ? STUDIO_E_NO_VIDEO : `${part} · ${STUDIO_E_NO_VIDEO}`;

export const barStatusOf = (kind: LoopKind, part: string | null): string => {
  if (kind === 'step') {
    return 'Schritt wird wiederholt · nochmal tippen spielt weiter';
  }
  if (kind === 'part') {
    return `${part ?? 'Teil'} wird wiederholt · nochmal halten spielt weiter`;
  }

  return 'Schritt antippen: wiederholen · halten: ganzer Teil';
};

export const STUDIO_E_STEPS_TITLE = 'Schritte';
export const STUDIO_E_STEPS_OPEN = 'Alle Schritte zeigen';
export const STUDIO_E_STEPS_CLOSE = 'Schritte schließen';
export const STUDIO_E_STEPS_FILMED = 'Mit Trainervideo';
export const STUDIO_E_NO_PART = 'Ohne Teil';

const spanOf = (start: number, end: number): string => `${clockOf(start)}–${clockOf(end)}`;

export const stepsGroupMetaOf = (start: number, end: number, count: number): string =>
  `${spanOf(start, end)} · ${count} ${count === 1 ? 'Schritt' : 'Schritte'}`;

export const stepsRowMetaOf = (start: number, end: number, eights: number | null): string =>
  eights === null
    ? spanOf(start, end)
    : `${spanOf(start, end)} · ${String(eights).replace('.', ',')} × 8`;

export const stepsRowLabelOf = (name: string): string => `${name}: dorthin springen`;

export const stepsLoopLabelOf = (name: string): string => `${name} wiederholen`;

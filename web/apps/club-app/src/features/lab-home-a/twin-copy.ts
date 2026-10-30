import type { LoopKind } from '@/features/act-practice/practice-controls';
import { PRACTICE_NOW } from '@/features/act-practice/practice-copy';
import type { TwinCueTone } from './twin-practice';

export const TWIN_LABEL = 'Üben';
export const TWIN_EYEBROW = 'Üben';
export const TWIN_CLOSE = 'Üben beenden';
export const TWIN_SPINE_LABEL = 'Dieser Schritt';
export const TWIN_DOCK_LABEL = 'Abspielen, springen und wiederholen';
export const TWIN_NOTE_CLOSE = 'Schließen';
export const TWIN_NO_NOTE = 'Für diesen Schritt gibt es keine Beschreibung.';
export const TWIN_SILENT_TITLE = 'Noch nichts zum Üben';
export const TWIN_SILENT_TEXT =
  'Für diesen Auftritt gibt es noch keine Musik. Sobald sie da ist, übst du hier mit Video und Bühne.';

const loopTexts: Record<LoopKind, string> = {
  off: 'Aus',
  step: 'Schritt',
  part: 'Teil',
};

const loopLabels: Record<LoopKind, string> = {
  off: 'Wiederholen ist aus, tippen wiederholt diesen Schritt',
  step: 'Schritt wird wiederholt, tippen wiederholt den ganzen Teil',
  part: 'Teil wird wiederholt, tippen spielt normal weiter',
};

export const loopTextOf = (kind: LoopKind): string => loopTexts[kind];

export const loopLabelOf = (kind: LoopKind): string => loopLabels[kind];

export const eyebrowOf = (part: string | null, eight: number, eights: number): string => {
  const place = eight === 0 ? null : `Achter ${eight}/${eights}`;

  return [part, place].filter((piece) => piece !== null).join(' · ');
};

export const cueLineOf = (
  tone: TwinCueTone,
  counts: number | null,
  spot: number | null,
): string | null => {
  if (tone === 'now') {
    return PRACTICE_NOW;
  }
  if (tone === 'soon' && counts !== null) {
    return `in ${counts}`;
  }

  return spot === null ? null : `Platz ${spot}`;
};

export const railLabelOf = (name: string): string =>
  `${name}: hierhin springen, halten wiederholt den Schritt`;

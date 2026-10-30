import { clockOf } from '@/features/act-practice/practice-step-list';
import type { CountSpanView } from './studio-h-timing';

export type StudioTool = 'music' | 'steps' | 'formation' | 'movement' | 'video';

export const STUDIO_H_FALLBACK_TITLE = 'Auftritt bearbeiten';
export const STUDIO_H_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const STUDIO_H_CLOSED = 'Für diesen Auftritt gibt es noch nichts zu üben.';
export const STUDIO_H_LABEL = 'Üben und bearbeiten';
export const STUDIO_H_EDIT = 'Bearbeiten';
export const STUDIO_H_DONE = 'Fertig';
export const STUDIO_H_TOOLS_LABEL = 'Werkzeug wählen';

export const STUDIO_H_TOOLS: readonly { tool: StudioTool; label: string }[] = [
  { tool: 'music', label: 'Musik' },
  { tool: 'steps', label: 'Schritte' },
  { tool: 'formation', label: 'Aufstellung' },
  { tool: 'movement', label: 'Bewegung' },
  { tool: 'video', label: 'Video' },
];

export const STUDIO_H_WAVE_LABEL = 'Musik: tippen oder ziehen zum Spulen';
export const STUDIO_H_SONGS = 'Lieder';
export const STUDIO_H_FINAL = 'Endfassung';
export const STUDIO_H_FINAL_NONE = 'keine · Hochladen und Angleichen kommt noch';
export const STUDIO_H_SONG_SELECTED = 'gewählt';

export const STUDIO_H_MARKS_LABEL = 'Schritte und Teile';
export const STUDIO_H_NAME_LABEL = 'Name des Schritts';
export const STUDIO_H_NAME_PLACEHOLDER = 'Name';
export const STUDIO_H_NOTE_LABEL = 'Beschreibung des Schritts';
export const STUDIO_H_NOTE_PLACEHOLDER = 'Beschreibung hinzufügen';

export const STUDIO_H_STAGE_LABEL = 'Bühne: Punkte antippen und ziehen';
export const STUDIO_H_FRONT = 'Publikum';
export const STUDIO_H_TOOLBAR_LABEL = 'Bühne bearbeiten';
export const STUDIO_H_MULTI = 'Mehrere';
export const STUDIO_H_MIRROR = 'Spiegeln';
export const STUDIO_H_ONION = 'Vorher';
export const STUDIO_H_NOTHING_SELECTED = 'Punkt antippen';
export const STUDIO_H_SELECTION_OPEN = 'Auswahl zeigen';
export const STUDIO_H_SPOTS = 'Plätze';
export const STUDIO_H_SPOTS_CLOSE = 'Auswahl schließen';
export const STUDIO_H_OPEN_SPOT = 'offen';
export const STUDIO_H_LATER_TITLE = 'Ausrichten · Verteilen · Vorlagen · Von Schritt kopieren';
export const STUDIO_H_LATER = 'kommt noch';
export const STUDIO_H_SELECTED = 'gewählt';

export const STUDIO_H_COUNTS_LABEL = 'Zählzeiten des Schritts: von Zählzeit zu Zählzeit ziehen';
export const STUDIO_H_NO_MOVE = 'Kein Weg in diesem Schritt';
export const STUDIO_H_PICK_DOTS = 'Punkte auf der Bühne wählen';

export const STUDIO_H_PLACEMENT_LABEL = 'Wo das Video auf der Musik liegt';
export const STUDIO_H_EARLIER = 'Video früher';
export const STUDIO_H_LATER_NUDGE = 'Video später';
export const STUDIO_H_TAKES = 'Videos je Teil';
export const STUDIO_H_MAIN = 'Haupt';
export const STUDIO_H_ALTERNATIVE = 'Alternative';
export const STUDIO_H_OUTDATED = 'veraltet';
export const STUDIO_H_NO_VIDEO = 'kein Video';
export const STUDIO_H_NO_VIDEO_HERE = 'Hier liegt kein Video';

export const fineClockOf = (seconds: number): string => {
  const sign = seconds < 0 ? '-' : '';
  const tenths = Math.round(Math.abs(seconds) * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  const [whole = '0', fraction = '0'] = rest.toFixed(1).split('.');

  return `${sign}${minutes}:${whole.padStart(2, '0')},${fraction}`;
};

export const offsetTextOf = (seconds: number): string => {
  const sign = seconds > 0 ? '+' : seconds < 0 ? '−' : '±';

  return `${sign}${Math.abs(seconds).toFixed(2).replace('.', ',')} s`;
};

export const songMetaOf = (start: number, end: number, bpm: number | null): string =>
  bpm === null
    ? `${clockOf(start)}–${clockOf(end)}`
    : `${clockOf(start)}–${clockOf(end)} · ${Math.round(bpm)} BPM`;

export const songCardMetaOf = (
  start: number,
  end: number,
  duration: number | null,
  bpm: number | null,
): string => {
  const cut = `Schnitt ${clockOf(start)}–${clockOf(end)}`;
  const whole = duration === null ? '' : ` von ${clockOf(duration)}`;
  const tempo = bpm === null ? ' · Takt fehlt' : ` · ${Math.round(bpm)} BPM`;

  return `${cut}${whole}${tempo}`;
};

export const songNameOf = (fileName: string): string => fileName.replace(/\.[a-z0-9]+$/i, '');

export const songRowLabelOf = (name: string): string => `${name}: an den Anfang springen`;

export const cutHandleLabelOf = (edge: 'start' | 'end', name: string): string =>
  edge === 'start' ? `Anfang von ${name} schneiden` : `Ende von ${name} schneiden`;

export const markLabelOf = (number: number, name: string): string =>
  `Schritt ${number} ${name}: dorthin springen`;

export const borderLabelOf = (name: string): string => `Grenze nach ${name} verschieben`;

export const spotTitleOf = (number: number, name: string | null): string =>
  name === null ? `Platz ${number}` : `Platz ${number} · ${name}`;

export const selectionTextOf = (count: number, single: string | null): string => {
  if (count === 0) {
    return STUDIO_H_NOTHING_SELECTED;
  }

  return count === 1 && single !== null ? single : `${count} Plätze`;
};

export const spotMetaOf = (rightMetres: number, backMetres: number, keys: number): string => {
  const side =
    Math.abs(rightMetres) < 0.05
      ? 'Mitte'
      : `${Math.abs(rightMetres).toFixed(1).replace('.', ',')} m ${rightMetres > 0 ? 'rechts' : 'links'}`;

  return `${side} · ${backMetres.toFixed(1).replace('.', ',')} m hinten · ${keys} Wegpunkte`;
};

export const formationTextOf = (number: number, start: number): string =>
  `Aufstellung Schritt ${number} · ab ${fineClockOf(start)}`;

export const countSpanTextOf = (view: CountSpanView | null, eights: number): string => {
  if (view === null) {
    return STUDIO_H_NO_MOVE;
  }

  const takt = `Takt ${view.fromCount} – ${view.toCount}`;

  if (eights < 2) {
    return takt;
  }

  return view.fromEight === view.toEight
    ? `${takt} · ${view.fromEight + 1}. Achter`
    : `${takt} · Achter ${view.fromEight + 1}–${view.toEight + 1}`;
};

export const movedDotsTextOf = (count: number): string =>
  count === 1 ? '1 Platz' : `${count} Plätze`;

export const placementTextOf = (name: string, start: number, offset: number): string =>
  `${name} · ab ${fineClockOf(start)} · Versatz ${offsetTextOf(offset)}`;

export const videoBarLabelOf = (name: string): string => `${name}: wählen und verschieben`;

export const takeMetaOf = (start: number | null, duration: number | null): string =>
  start === null || duration === null
    ? 'noch nicht angelegt'
    : `${fineClockOf(start)}–${fineClockOf(start + duration)}`;

export const dotLabelOf = (number: number, name: string | null): string =>
  `${spotTitleOf(number, name)}: wählen und ziehen`;

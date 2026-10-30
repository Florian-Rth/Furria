import { fineClockOf } from '@/features/act-studio/studio-copy';
import type { SetupTask } from './focus-setup';

export const FOCUS_FALLBACK_TITLE = 'Auftritt bearbeiten';
export const FOCUS_LABEL = 'Auftritt bearbeiten';
export const FOCUS_DENIED = 'Diesen Auftritt kannst du nicht bearbeiten.';
export const FOCUS_CLOSED = 'Für diesen Auftritt gibt es noch keine Probe.';
export const FOCUS_READ_ONLY = 'Bearbeiten dürfen nur die Verantwortlichen dieses Auftritts.';
export const FOCUS_MUSIC_PAGE = 'Musik & Video';
export const FOCUS_TOOLBAR = 'Abspielen und Bearbeiten';
export const FOCUS_TRANSPORT = 'Abspielen';
export const FOCUS_VIEW = 'Ansicht';
export const FOCUS_HISTORY_GROUP = 'Verlauf';
export const FOCUS_PLAY = 'Abspielen';
export const FOCUS_PAUSE = 'Anhalten';
export const FOCUS_PREVIOUS = 'Voriger Schritt';
export const FOCUS_NEXT = 'Nächster Schritt';
export const FOCUS_FORMATION = 'Aufstellung';
export const FOCUS_PATHS = 'Wege';
export const FOCUS_ZOOM_IN = 'Näher';
export const FOCUS_ZOOM_OUT = 'Weiter weg';
export const FOCUS_UNDO = 'Rückgängig';
export const FOCUS_REDO = 'Wiederholen';
export const FOCUS_HISTORY = 'Verlauf';
export const FOCUS_HISTORY_TITLE = 'Verlauf dieses Besuchs';
export const FOCUS_HISTORY_EMPTY = 'Noch nichts geändert.';
export const FOCUS_SETUP_TITLE = 'Einrichten';
export const FOCUS_CLOCK_LABEL = 'Stelle in der Musik';
export const FOCUS_STAGE_LABEL = 'Bühne: Punkte ziehen oder mit Pfeiltasten verschieben';
export const FOCUS_FRONT = 'Publikum';
export const FOCUS_CONTEXT = 'Aufstellung bearbeiten';
export const FOCUS_LINE = 'Linie';
export const FOCUS_BLOCK = 'Block';
export const FOCUS_CIRCLE = 'Kreis';
export const FOCUS_MIRROR = 'Spiegeln';
export const FOCUS_ALIGN_ACROSS = 'Ausrichten ↔';
export const FOCUS_ALIGN_DEEP = 'Ausrichten ↕';
export const FOCUS_DISTRIBUTE = 'Verteilen';
export const FOCUS_COPY_PREVIOUS = 'Vom vorigen übernehmen';
export const FOCUS_MULTI = 'Mehrere';
export const FOCUS_DESELECT = 'Auswahl aufheben';
export const FOCUS_ADD_SPOT = 'Platz dazu';
export const FOCUS_OUTLINE = 'Teile und Schritte';
export const FOCUS_STEP_HERE = 'Schritt hier';
export const FOCUS_PART_HERE = 'Neuer Teil ab hier';
export const FOCUS_STEP_REMOVE = 'Schritt löschen';
export const FOCUS_STEP_REMOVE_SURE = 'Wirklich löschen?';
export const FOCUS_STEP_NAME = 'Name des Schritts';
export const FOCUS_PART_NAME = 'Name des Teils';
export const FOCUS_UNNAMED = 'ohne Namen';
export const FOCUS_NO_PART = 'Ohne Teil';
export const FOCUS_TIMELINE = 'Zeitleiste';
export const FOCUS_OVERVIEW = 'Ganzer Auftritt: tippen zum Hinspringen';
export const FOCUS_BRACKET =
  'Ausschnitt: Pfeile links und rechts verschieben, hoch und runter zoomen';
export const FOCUS_LANE_STEPS = 'Schritte';
export const FOCUS_LANE_MUSIC = 'Musik';
export const FOCUS_LANE_VIDEO = 'Video';
export const FOCUS_LANE_PATHS = 'Wege';
export const FOCUS_NONE = 'keine';
export const FOCUS_PICK_SPOT = 'Platz wählen';
export const FOCUS_CARDS = 'Schritte zum Wischen';
export const FOCUS_COUNTS = 'Zählzeiten des Schritts: tippen zum Hinspringen';
export const FOCUS_CHIPS = 'Aufstellung';
export const FOCUS_SETUP_CARD = 'Auftritt einrichten';

export const SETUP_TEXT: Record<SetupTask, string> = {
  music: 'Musik hinzufügen',
  steps: 'Ersten Schritt setzen',
  spots: 'Plätze anlegen',
  formation: 'Aufstellung setzen',
  video: 'Video hinzufügen',
  final: 'Endfassung hochladen',
};

export const SETUP_HINT: Record<SetupTask, string> = {
  music: 'Lieder auswählen und hochladen',
  steps: 'Am Anfang der Musik',
  spots: 'Einen Platz auf die Bühne stellen',
  formation: 'Alle in eine Linie, dann ziehen',
  video: 'Trainervideo hochladen',
  final: 'Die fertig geschnittene Musik',
};

export const setupChipOf = (done: number, total: number): string => `${done} von ${total}`;

export const setupChipLabelOf = (done: number, total: number): string =>
  `Einrichten: ${done} von ${total} erledigt, Liste öffnen`;

export const clockMetaOf = (step: number, steps: number, count: string | null): string => {
  const place = steps === 0 ? 'kein Schritt' : `Schritt ${step}/${steps}`;

  return count === null ? place : `${place} · ${count}`;
};

export const countTextOf = (count: number, eight: number): string =>
  `${eight + 1}. Achter · ${count}`;

export const stepLabelOf = (number: number, name: string): string =>
  `Schritt ${number}${name === '' ? '' : ` ${name}`}`;

export const stepMetaOf = (start: number | null, end: number | null, eights: number): string => {
  const length = start === null || end === null ? '' : `${Math.round(end - start)} s`;

  return eights > 0 ? `${eights}×8` : length;
};

export const partMetaOf = (start: number | null, steps: number): string =>
  start === null ? `${steps}` : `${fineClockOf(start).split(',')[0]} · ${steps}`;

export const borderTextOf = (seconds: number): string => fineClockOf(seconds);

export const keyLabelOf = (seconds: number, name: string): string =>
  `Wegpunkt ${fineClockOf(seconds)} von ${name}: hinspringen`;

export const countLabelOf = (eight: number, count: number): string =>
  `${eight}. Achter, Zählzeit ${count}`;

export const eightTextOf = (eight: number): string => `${eight}. Achter`;

export const selectionNoteOf = (selected: number, spots: number): string =>
  selected === 0 ? `Alle ${spots}` : `${selected} gewählt`;

export const cardMetaOf = (number: number, total: number, eights: number): string =>
  eights > 0 ? `${eights}×8 · ${number}/${total}` : `${number}/${total}`;

export const laneMusicMetaOf = (length: number): string =>
  length <= 0 ? FOCUS_NONE : (fineClockOf(length).split(',')[0] ?? FOCUS_NONE);

export const bracketTextOf = (start: number, end: number): string =>
  `${fineClockOf(Math.max(0, start))} bis ${fineClockOf(end)}`;

export const uploadingTextOf = (share: number): string => `lädt ${Math.round(share * 100)} %`;

export const dotNameOf = (number: number, firstName: string | null): string =>
  firstName ?? `Platz ${number}`;

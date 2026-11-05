import type { AreaKind, DoorKind, TextSize } from '@/features/hall-plan/schemas';
import type { HallTool } from './hall-builder-tools';

export const HALL_BUILDER_TITLE = 'Saal';
export const HALL_BUILDER_DESK_LABEL = 'Saal zeichnen';
export const HALL_CANVAS_LABEL = 'Saalplan';
export const HALL_TOOLS_LABEL = 'Werkzeuge';
export const HALL_STATUS_LABEL = 'Saal-Übersicht';
export const HALL_DENIED_MESSAGE = 'Säle zeichnen darf, wer Saal & Tische betreut.';
export const HALL_LOAD_FAILED = 'Der Saal konnte nicht geladen werden.';
export const HALL_RETRY_LABEL = 'Erneut laden';
export const HALL_CONFLICT_MESSAGE =
  'Der Saal wurde inzwischen woanders geändert. Der neueste Stand ist geladen.';
export const HALL_FALLBACK_NAME = 'Saal';

export const TOOL_LABELS: Record<HallTool, string> = {
  select: 'Auswahl (V)',
  wall: 'Wand (W)',
  door: 'Tür (D)',
  area: 'Fläche (F)',
  pillar: 'Säule (S)',
  line: 'Linie (L)',
  text: 'Text (T)',
  measure: 'Messen (M)',
};

export const UNDO_LABEL = 'Rückgängig';
export const REDO_LABEL = 'Wiederholen';
export const FIT_LABEL = 'Einpassen';
export const DUPLICATE_LABEL = 'Duplizieren';
export const DELETE_LABEL = 'Löschen';
export const MERGE_AREAS_LABEL = 'Zusammenfügen';
export const MERGE_AREAS_APART_NOTE =
  'Zusammenfügen geht nur, wenn sich die Flächen berühren oder überschneiden.';
export const ROTATE_LEFT_LABEL = '−15°';
export const ROTATE_RIGHT_LABEL = '+15°';
export const INSPECTOR_CLOSE_LABEL = 'Schließen';

export const SAVE_STATE_LABELS = {
  saved: 'Gespeichert',
  saving: 'Speichert …',
  pending: 'Ungespeichert',
  failed: 'Nicht gespeichert',
} as const;

export const POLYLINE_DONE_LABEL = 'Fertig';
export const POLYLINE_CANCEL_LABEL = 'Abbrechen';
export const MEASURE_CLEAR_LABEL = 'Maß löschen';
export const SIZE_COUNT_LABEL = 'Saalgröße';
export const ELEMENT_COUNT_LABEL = 'Elemente';
export const NO_SIZE_VALUE = '—';

export const ELEMENT_KIND_LABELS = {
  wall: 'Wand',
  door: 'Tür',
  area: 'Fläche',
  pillar: 'Säule',
  line: 'Linie',
  text: 'Text',
} as const;

export const DOOR_KIND_LABELS: Record<DoorKind, string> = {
  entrance: 'Eingang',
  emergencyExit: 'Notausgang',
  door: 'Tür',
};

export const AREA_KIND_LABELS: Record<AreaKind, string> = {
  stage: 'Bühne',
  bar: 'Theke',
  technics: 'Technik',
  wardrobe: 'Garderobe',
  toilets: 'Toiletten',
  kitchen: 'Küche',
  other: 'Sonstiges',
};

export const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  small: 'Klein',
  medium: 'Mittel',
  large: 'Groß',
};

export const PILLAR_SHAPE_LABELS = { square: 'Eckig', round: 'Rund' } as const;

export const HALL_SECTION_TITLE = 'Saal';
export const HALL_NAME_LABEL = 'Name';
export const HALL_VENUE_LABEL = 'Ort';
export const HALL_DELETE_LABEL = 'Saal löschen';
export const HALL_DELETE_QUESTION = 'Diesen Saal löschen?';
export const HALL_DELETE_EXPLANATION =
  'Der Saal verschwindet mit allen Wänden, Türen und Flächen. Ein Saal, auf dem ein Tischplan liegt, bleibt.';
export const HALL_DELETE_EYEBROW = 'Saal';
export const CANCEL_LABEL = 'Abbrechen';
export const HELP_TITLE = 'So geht’s';
export const SELECTION_SECTION_TITLE = 'Auswahl';
export const KIND_LABEL = 'Art';
export const LABEL_LABEL = 'Beschriftung';
export const LABEL_HINT = 'Steht auf dem Plan; leer zeigt die Art.';
export const TEXT_LABEL = 'Text';
export const SIZE_LABEL = 'Größe';
export const WIDTH_LABEL = 'Breite (cm)';
export const DEPTH_LABEL = 'Tiefe (cm)';
export const LENGTH_LABEL = 'Länge (cm)';
export const THICKNESS_LABEL = 'Stärke (cm)';
export const ROTATION_LABEL = 'Drehung (°)';
export const SHAPE_LABEL = 'Form';
export const STEP_LESS_LABEL = 'Weniger';
export const STEP_MORE_LABEL = 'Mehr';
export const MANY_SELECTED_TITLE = 'Mehrere Elemente';

export const toManySelectedLine = (count: number): string => `${count} Elemente ausgewählt`;

export const TOOL_HINTS: Record<HallTool, string> = {
  select:
    'Antippen wählt aus, Ziehen verschiebt. Leere Fläche: Rahmen ziehen (Maus) oder Plan schieben (Finger).',
  wall: 'Punkte setzen. Doppelklick, Enter oder „Fertig“ beendet; Klick auf den ersten Punkt schließt den Raum.',
  door: 'Entlang der Wand ziehen. Die Art steht danach in der Auswahl.',
  area: 'Rechteck aufziehen. Die Art steht danach in der Auswahl.',
  pillar: 'Antippen setzt eine Säule.',
  line: 'Punkte setzen wie bei der Wand. Linien markieren nur, sie stehen nichts im Weg.',
  text: 'Antippen setzt einen Text.',
  measure: 'Zwei Punkte antippen oder ziehen.',
};

export const KEY_HINT =
  'Strg+Z / Strg+Umschalt+Z · Entf löscht · Pfeile schieben (Umschalt: 10 cm) · Strg+D dupliziert · Alt rastet nicht ein';

export const INSPECT_SELECTION_LABEL = 'Auswahl bearbeiten';
export const INSPECT_HALL_LABEL = 'Saal-Angaben';

export const toMeasureChipLabel = (distance: string): string =>
  `${distance} · ${MEASURE_CLEAR_LABEL}`;

export const VENUE_HALLS_TITLE = 'Säle';
export const VENUE_HALLS_EMPTY = 'Noch kein Saal gezeichnet.';
export const VENUE_HALLS_ADD_LABEL = 'Saal zeichnen';
export const VENUE_HALLS_LOADING = 'Säle werden geladen …';

export const toHallUpdatedMeta = (day: string): string => `geändert ${day}`;

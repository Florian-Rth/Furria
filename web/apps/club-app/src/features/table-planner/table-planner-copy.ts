import type { FindingKind } from '@/features/hall-plan/plan-clearance';
import { formatDistance } from '@/features/hall-plan/plan-measure';
import type { RectSide, Seating, TableShape } from '@/features/hall-plan/schemas';
import type { PlannerTool, PlannerView } from './planner-tools';

export const PAGE_TITLE = 'Tischplan';
export const DESK_LABEL = 'Tischplan bearbeiten';
export const CANVAS_LABEL = 'Tischplan';
export const RAIL_LABEL = 'Werkzeuge';
export const STATUS_LABEL = 'Stand des Tischplans';
export const PALETTE_LABEL = 'Tischart';
export const EDIT_HALL_LABEL = 'Saal bearbeiten';
export const LOADING_LABEL = 'Der Tischplan wird geladen';
export const LOAD_FAILED = 'Der Tischplan ließ sich nicht laden.';
export const RETRY_LABEL = 'Erneut laden';
export const CHANGED_ELSEWHERE =
  'Der Tischplan wurde inzwischen woanders geändert. Er ist neu geladen.';

export const TOOL_LABELS: Record<PlannerTool, string> = {
  select: 'Auswählen',
  table: 'Tisch stellen',
  row: 'Tischreihe ziehen',
  seats: 'Für Personen',
  measure: 'Messen',
};

export const UNDO_LABEL = 'Rückgängig';
export const REDO_LABEL = 'Wiederholen';
export const FIT_LABEL = 'Einpassen';

export const VIEW_LABELS: Record<PlannerView, string> = {
  plan: 'Planen',
  setup: 'Aufbau',
};

export const SEATING_LABELS: Record<Seating, string> = {
  comfortable: 'Bequem',
  maximum: 'Maximal',
};

export const SEATING_FIELD_LABEL = 'Bestuhlung';
export const SEATING_PLAN_DEFAULT = 'Wie im Plan';
export const NUMBERING_LABEL = 'Nummern vergeben';
export const SETTINGS_LABEL = 'Tische & Stühle';
export const EDIT_SELECTION_LABEL = 'Bearbeiten';
export const TABLES_COUNT_LABEL = 'Tische';
export const CHAIRS_COUNT_LABEL = 'Stühle';
export const NO_FINDINGS_LABEL = 'Abstände passen';
export const FINDINGS_TITLE = 'Abstände';
export const FINDINGS_CLOSE = 'Schließen';
export const NO_FINDINGS_NOTE = 'Keine Überschneidung und keine Engstelle.';
export const SHOW_FINDING_LABEL = 'Zeigen';

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const toFindingsChipLabel = (conflicts: number, hints: number): string => {
  const parts = [
    ...(conflicts > 0 ? [plural(conflicts, 'Überschneidung', 'Überschneidungen')] : []),
    ...(hints > 0 ? [plural(hints, 'Engstelle', 'Engstellen')] : []),
  ];

  return parts.length === 0 ? NO_FINDINGS_LABEL : parts.join(' · ');
};

const FINDING_TITLES: Record<FindingKind, string> = {
  chairsOverlap: 'Stuhlbereiche überschneiden sich',
  chairsBlocked: 'Stuhlbereich stößt an den Saal',
  tablesOverlap: 'Tische überschneiden sich',
  tableBlocked: 'Tisch steht im Saal im Weg',
  exitBlocked: 'Notausgang verstellt',
  narrowAisle: 'Gang zu schmal',
};

export const toFindingTitle = (kind: FindingKind): string => FINDING_TITLES[kind];

export const toFindingDistance = (kind: FindingKind, distanceCm: number): string =>
  kind === 'narrowAisle' ? formatDistance(distanceCm) : 'überschneidet sich';

export const toFindingMarkLabel = (kind: FindingKind, distanceCm: number): string =>
  kind === 'narrowAisle' ? formatDistance(distanceCm) : '!';

export const SIDE_LABELS: Record<RectSide, string> = {
  front: 'Vorne',
  back: 'Hinten',
  start: 'Links',
  end: 'Rechts',
};

export const toRowLabel = (number: string | null, count: number): string => {
  if (number !== null) {
    return `Tisch ${number}`;
  }

  return count === 1 ? 'Tisch' : `Tischreihe (${count} Tische)`;
};

export const toGroupLabel = (number: string | null): string =>
  number === null ? 'Tischgruppe' : `Tischgruppe ${number}`;

export const toRowsLabel = (count: number): string => plural(count, 'Tischreihe', 'Tischreihen');

export const toChairLabel = (number: string | null, rowLabel: string): string =>
  number === null ? `Stuhl an ${rowLabel}` : `Stuhl ${number} an ${rowLabel}`;

export const toRowFacts = (tables: number, chairs: number): string =>
  `${plural(tables, 'Tisch', 'Tische')} · ${plural(chairs, 'Stuhl', 'Stühle')}`;

export const toPlanMeta = (hallName: string, tables: number, chairs: number): string =>
  `${hallName} · ${toRowFacts(tables, chairs)}`;

export const toDragReadout = (tables: number, chairs: number): string => toRowFacts(tables, chairs);

export const SHAPE_LABELS: Record<TableShape, string> = {
  rectangle: 'Eckig',
  round: 'Rund',
};

export const toTableTypeMeta = (
  shape: TableShape,
  lengthCm: number,
  widthCm: number,
  seatsAtEnds: boolean,
): string =>
  shape === 'round'
    ? `Rund · Ø ${lengthCm} cm`
    : `${lengthCm} × ${widthCm} cm${seatsAtEnds ? ' · Stühle an den Enden' : ''}`;

export const PLAN_PANEL_TITLE = 'Tischplan';
export const INSPECTOR_LABEL = 'Auswahl bearbeiten';
export const INSPECTOR_CLOSE = 'Schließen';
export const TYPE_FIELD_LABEL = 'Tischart';
export const COUNT_FIELD_LABEL = 'Tische in der Reihe';
export const COUNT_STEP_LABELS = { less: 'Ein Tisch weniger', more: 'Ein Tisch mehr' } as const;
export const SIDES_FIELD_LABEL = 'Stühle an den Seiten';
export const ROTATION_FIELD_LABEL = 'Drehung';
export const ROTATE_LEFT_LABEL = '15° nach links drehen';
export const ROTATE_RIGHT_LABEL = '15° nach rechts drehen';
export const ROTATE_LEFT_SHORT = '−15°';
export const ROTATE_RIGHT_SHORT = '+15°';
export const NUMBER_FIELD_LABEL = 'Nummer';
export const NOTE_FIELD_LABEL = 'Notiz';
export const DUPLICATE_LABEL = 'Duplizieren';
export const DELETE_LABEL = 'Löschen';
export const GROUP_LABEL = 'Gruppieren';
export const UNGROUP_LABEL = 'Gruppe lösen';
export const WHOLE_GROUP_LABEL = 'Ganze Gruppe wählen';
export const REMOVE_CHAIR_LABEL = 'Stuhl entfernen';
export const RESTORE_CHAIR_LABEL = 'Stuhl zurückstellen';
export const CHAIR_NOTICES = {
  removed: 'Stuhl entfernt.',
  leftOut: 'Kein Platz – Stuhl weggelassen.',
  kept: 'Stuhl steht trotz Platzmangel.',
} as const;
export const KEEP_CHAIR_LABEL = 'Trotzdem hinstellen';
export const RELEASE_CHAIR_LABEL = 'Wieder weglassen';
export const RELEASE_CHAIRS_LABEL = 'Stühle wieder weglassen';
export const SEATS_FIELD_LABEL = 'Stühle gebraucht';
export const TABLES_PER_ROW_LABEL = 'Tische pro Reihe';
export const SEAT_SHAPE_LABEL = 'Form';
export const SEAT_SHAPE_LABELS = { row: 'Reihe', block: 'Block' } as const;
export const SEATS_HINT = 'Tippe in den Saal, um die Tische hinzustellen.';

export const toRotationValue = (degrees: number): string => `${Math.round(degrees)}°`;

export const START_TITLE = 'Tischplan anlegen';
export const START_HALLS_TITLE = 'Saal wählen';
export const START_COPY_TITLE = 'Übernehmen von';
export const START_DRAW_LABEL = 'Saal zeichnen';
export const START_NO_HALLS_TITLE = 'Noch kein Saal';
export const START_NO_HALLS_NOTE = 'Zeichne zuerst einen Saal.';
export const START_NO_VENUE_NOTE = 'Die Veranstaltung hat noch keinen Ort.';
export const START_LOADING_LABEL = 'Säle werden geladen';
export const toHallMeta = (venueName: string, isEventVenue: boolean): string =>
  isEventVenue ? `${venueName} · Ort der Veranstaltung` : venueName;
export const toCopyMeta = (day: string, hallName: string, tables: number): string =>
  `${day} · ${hallName} · ${plural(tables, 'Tisch', 'Tische')}`;

export const SETTINGS_TITLE = 'Tische & Stühle';
export const SETTINGS_CLOSE = 'Schließen';
export const STANDARD_SECTION_TITLE = 'Abstände';
export const COMFORTABLE_FIELD_LABEL = 'Platz je Stuhl, bequem (cm)';
export const MAXIMUM_FIELD_LABEL = 'Platz je Stuhl, maximal (cm)';
export const CHAIR_DEPTH_FIELD_LABEL = 'Tiefe des Stuhlbereichs (cm)';
export const AISLE_FIELD_LABEL = 'Mindestgang (cm)';
export const EXIT_FIELD_LABEL = 'Frei vor Notausgängen (cm)';
export const STANDARD_SAVE_LABEL = 'Abstände speichern';
export const STEP_LABELS = { less: 'Weniger', more: 'Mehr' } as const;
export const TYPES_SECTION_TITLE = 'Tischarten';
export const NEW_TYPE_LABEL = 'Tischart anlegen';
export const TYPE_NAME_LABEL = 'Name';
export const TYPE_SHAPE_LABEL = 'Form';
export const TYPE_LENGTH_LABEL = 'Länge (cm)';
export const TYPE_DIAMETER_LABEL = 'Durchmesser (cm)';
export const TYPE_WIDTH_LABEL = 'Breite (cm)';
export const TYPE_ENDS_LABEL = 'Stühle an den Enden';
export const TYPE_SAVE_LABEL = 'Tischart speichern';
export const TYPE_CANCEL_LABEL = 'Abbrechen';
export const TYPE_REMOVE_LABEL = 'Entfernen';
export const TYPE_EDIT_LABEL = 'Bearbeiten';
export const STANDARD_INVALID = 'Bitte ganze Zahlen von 10 bis 500; maximal nicht mehr als bequem.';
export const TYPE_INVALID = 'Bitte Name und Maße (30 bis 1000 cm) angeben.';

export const TOUCH_TOOL_LABELS: Record<PlannerTool, string> = {
  select: 'Auswahl',
  table: 'Tisch',
  row: 'Tischreihe',
  seats: 'Für X Personen',
  measure: 'Messen',
};

export const ADD_LABEL = 'Hinzufügen';
export const ADD_CLOSE = 'Schließen';
export const DOCK_LABEL = 'Werkzeuge';
export const ACTION_BAR_LABEL = 'Auswahl bearbeiten';
export const MORE_LABEL = 'Mehr';
export const LESS_TABLE_LABEL = 'Ein Tisch weniger';
export const MORE_TABLE_LABEL = 'Ein Tisch mehr';
export const TABLE_COUNT_READOUT_LABEL = 'Tische in der Reihe';
export const TOOL_DONE_LABEL = 'Fertig';
export const TOOL_TRAY_LABEL = 'Aktives Werkzeug';
export const PLACE_SEATS_LABEL = 'Hier hinstellen';
export const SEATS_CONTINUE_LABEL = 'Weiter';
export const PLAN_FACTS_LABEL = 'Plan';
export const MEASURE_CLEAR_LABEL = 'Maß löschen';
export const CHAIR_NUMBER_ACTION = 'Nummer';
export const CHAIR_NOTE_ACTION = 'Notiz';

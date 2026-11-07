import type { CastChoice, EditJob, JobReason } from '@furria/studio/edit-jobs';
import { fineClockOf } from '@furria/studio/studio-copy';
import type { KkEjGlyphName } from '@furria/ui/KkEjGlyph';

const COUNTS_PER_EIGHT = 8;

export const EJ_PAGE_LABEL = 'Sessionsauftritt bearbeiten';
export const EJ_JOBS_LABEL = 'Was bearbeitest du?';

export const EJ_JOB_TEXT: Record<EditJob, string> = {
  steps: 'Schritte',
  formation: 'Aufstellung',
  movement: 'Bewegung',
  cast: 'Besetzung',
};

export const EJ_JOB_GLYPH: Record<EditJob, KkEjGlyphName> = {
  steps: 'steps',
  formation: 'formation',
  movement: 'movement',
  cast: 'cast',
};

export const EJ_STAGE_HINT: Record<EditJob, string> = {
  steps: 'Bühne nur zum Ansehen',
  formation: 'Punkte ziehen · lange drücken wählt mehrere',
  movement: 'Punkt ziehen setzt einen Wegpunkt',
  cast: 'Platz antippen, dann Person wählen',
};

export const EJ_PICK_LINE: Record<EditJob, string> = {
  steps: '',
  formation: 'Plätze antippen oder Alle wählen',
  movement: 'Platz antippen – dann Weg und Blick',
  cast: 'Platz antippen – dann Person wählen',
};

export const EJ_STAGE = 'Bühne';
export const EJ_LANES = 'Zeitleiste: Teile, Musik, Schritte, Videos, Wegpunkte';
export const EJ_HEAD = 'Werkzeugleiste';
export const EJ_HISTORY_GROUP = 'Verlauf und Speichern';
export const EJ_LEAVE_GROUP = 'Bereiche';
export const EJ_HISTORY = 'Verlauf';
export const EJ_HISTORY_EMPTY = 'In diesem Besuch noch nichts geändert.';
export const EJ_HISTORY_LIST = 'Änderungen in diesem Besuch';
export const EJ_HISTORY_VISIT = 'In diesem Besuch';
export const EJ_VERSIONS = 'Gespeicherte Fassungen';
export const EJ_VERSIONS_NOTE =
  'Wiederherstellen gilt sofort für alle und lässt sich nicht mit Rückgängig zurücknehmen.';
export const EJ_VERSIONS_LOADING = 'Fassungen werden geladen …';
export const EJ_VERSION_RESTORE = 'Wiederherstellen';
export const EJ_VERSION_SURE = 'Wirklich wiederherstellen';
export const EJ_MUSIC_PAGE = 'Musik & Video';
export const EJ_DONE = 'Fertig';
export const EJ_DONE_LABEL = 'Fertig: Bearbeiten beenden';
export const EJ_MENU = 'Mehr';
export const EJ_MENU_TITLE = 'Weitere Bereiche';
export const EJ_MORE = 'Mehr …';
export const EJ_CLOSE = 'Schließen';
export const EJ_BACK = 'Zurück';
export const backToOf = (job: string): string => `Zurück zu ${job}`;
export const EJ_BAR_LABEL = 'Werkzeuge';
export const EJ_SURE = 'Wirklich löschen';
export const EJ_SURE_DISSOLVE = 'Wirklich auflösen';
export const EJ_EVENING_STEPS = 'An diesem Abend gelten die Schritte der Session – hier nur üben.';

export const jobHistoryTextOf = (count: number): string => `${EJ_HISTORY} · ${count}`;
export const jobMoreTitleOf = (job: EditJob): string => EJ_JOB_TEXT[job];

export const eightsTextOf = (counts: number): string => {
  const eights = Math.floor(counts / COUNTS_PER_EIGHT);
  const rest = counts % COUNTS_PER_EIGHT;
  if (eights === 0) {
    return `${rest} Zählzeiten`;
  }

  return rest === 0 ? `${eights} Achter` : `${eights} Achter + ${rest}`;
};

export const countLengthTextOf = (counts: number): string =>
  counts < COUNTS_PER_EIGHT
    ? `${counts} Zählzeiten`
    : `${counts} Zählzeiten · ${eightsTextOf(counts)}`;

export const cardEyebrowOf = (
  number: number,
  total: number,
  part: string | null,
  counts: number,
): string =>
  [`Schritt ${number}/${total}`, part, counts > 0 ? eightsTextOf(counts) : null]
    .filter((item) => item !== null)
    .join(' · ');

export const countPlaceOf = (eight: number, count: number): string => `Achter ${eight} · ${count}`;

export const EJ_STEP_OWNER = 'Schritt';
export const EJ_NO_STEP = 'Noch keine Schritte';
export const EJ_NO_STEP_MUSIC = 'Erst ein Lied hochladen, dann Schritte setzen.';
export const EJ_NO_STEP_HINT =
  'Abspielen und an der richtigen Stelle „Ersten Schritt setzen“ tippen.';
export const EJ_GROUP_TEXT = 'Name und Beschreibung';
export const EJ_NAME = 'Name';
export const EJ_GROUP_LENGTH = 'Länge';
export const EJ_SHORTER = 'Ende früher';
export const EJ_SHORTER_LABEL = 'Ende eine Zählzeit früher';
export const EJ_LONGER = 'Ende später';
export const EJ_LONGER_LABEL = 'Ende eine Zählzeit später';
export const EJ_LAST_STEP = 'Der letzte Schritt endet mit dem Lied.';
export const EJ_GROUP_STEPS = 'Teilen';
export const EJ_MARK = 'Hier teilen';
export const EJ_MARK_LABEL = 'Schritt an der Abspielposition teilen';
export const EJ_FIRST_STEP = 'Ersten Schritt setzen';
export const EJ_FIRST_STEP_LABEL = 'Ersten Schritt an der Abspielposition setzen';
export const EJ_NEW_PART = 'Neuer Teil ab hier';
export const EJ_GROUP_PRACTICE = 'Üben';
export const EJ_LOOP_STEP = 'Schritt wiederholen';
export const EJ_LOOP_STEP_LABEL = 'Diesen Schritt immer wieder abspielen';
export const EJ_LOOP_PART = 'Teil wiederholen';
export const EJ_LOOP_PART_LABEL = 'Diesen Teil immer wieder abspielen';
export const tempoTextOf = (rate: string): string => `Tempo ${rate}`;
export const EJ_STEP_DELETE = 'Schritt löschen';

export const stepTitleOf = (number: number, name: string): string => `Schritt ${number} · ${name}`;
export const stepOwnerOf = (number: number, total: number): string =>
  `Schritt ${number} von ${total}`;
export const stepMetaOf = (start: number, end: number, counts: number): string =>
  `${fineClockOf(start)}–${fineClockOf(end)} · ${countLengthTextOf(counts)}`;

export const EJ_PART_OWNER = 'Teil';
export const EJ_PART_NAME = 'Name des Teils';
export const EJ_GROUP_PART_START = 'Beginn';
export const EJ_PART_EARLIER = 'Beginnt früher';
export const EJ_PART_LATER = 'Beginnt später';
export const EJ_GROUP_MAIN_VIDEO = 'Hauptvideo';
export const EJ_PART_DISSOLVE = 'Teil auflösen';
export const partMetaOf = (first: number, last: number, count: number): string =>
  `Schritt ${first}–${last} · ${count === 1 ? '1 Schritt' : `${count} Schritte`}`;

export const EJ_FORMATION_OWNER = 'Aufstellung';
export const formationTitleOf = (number: number, name: string): string =>
  `Bei Schritt ${number} · ${name}`;
export const formationContextOf = (
  number: number,
  kind: 'all' | 'chosen',
  count: number,
): string =>
  kind === 'all'
    ? `Aufstellung bei Schritt ${number} · wirkt auf alle ${count} Plätze`
    : `Aufstellung bei Schritt ${number}`;
export const formationMetaOf = (kind: 'all' | 'chosen', count: number, total: number): string =>
  kind === 'all' ? `Nichts gewählt · wirkt auf alle ${count} Plätze` : pickedTextOf(count, total);
export const EJ_GROUP_PRESET = 'Vorlage';
export const EJ_LINE = 'Linie';
export const EJ_CIRCLE = 'Kreis';
export const EJ_BLOCK = 'Block';
export const EJ_GROUP_ORDER = 'Ordnen';
export const EJ_MIRROR = 'Spiegeln';
export const EJ_ROW_ACROSS = 'Reihe quer';
export const EJ_ROW_ACROSS_LABEL = 'Quer in eine Reihe stellen und gleich verteilen';
export const EJ_ROW_DEEP = 'Reihe tief';
export const EJ_ROW_DEEP_LABEL = 'Hintereinander in eine Reihe stellen und gleich verteilen';
export const EJ_ROW_NEEDS_TWO = 'Reihe quer und Reihe tief ab 2 gewählten Plätzen.';
export const EJ_GROUP_COPY = 'Aufstellung übernehmen';
export const EJ_COPY_PREVIOUS = 'Anderen früheren Schritt wählen';
export const EJ_COPY_NEXT = 'Anderen späteren Schritt wählen';
export const copyTextOf = (number: number): string => `Wie Schritt ${number} übernehmen`;
export const copyLabelOf = (number: number, scope: string): string =>
  `Aufstellung von Schritt ${number} übernehmen · ${scope}`;
export const EJ_GROUP_SELECTION = 'Auswahl';
export const EJ_SELECT_ALL = 'Alle wählen';
export const EJ_SELECT_ALL_LABEL = 'Alle Plätze wählen';
export const EJ_GROUP_SHOW = 'Anzeige';
export const EJ_ONION = 'Vorige Aufstellung zeigen';

export const EJ_MOVEMENT_OWNER = 'Bewegung';
export const movementTitleOf = (place: string | null): string =>
  place === null ? 'Vor der Musik' : `Bei ${place}`;
export const movementContextOf = (place: string | null): string =>
  `Bewegung bei ${place ?? 'Musikbeginn'}`;
export const EJ_NO_SPOT_PICKED = 'Nichts gewählt';
export const spotsPickedOf = (count: number): string =>
  count === 1 ? '1 Platz gewählt' : `${count} Plätze gewählt`;
export const pickedTextOf = (count: number, total: number): string =>
  total > 1 && count >= total ? `Alle ${count} Plätze gewählt` : spotsPickedOf(count);
export const EJ_GROUP_WAYPOINT = 'Wegpunkt hier';
export const EJ_WAYPOINT_SET = 'gesetzt';
export const EJ_EARLIER = 'Früher';
export const EJ_LATER = 'Später';
export const EJ_WAYPOINT_EARLIER_LABEL = 'Wegpunkt eine Zählzeit früher';
export const EJ_WAYPOINT_LATER_LABEL = 'Wegpunkt eine Zählzeit später';
export const EJ_WAYPOINT_DELETE = 'Wegpunkt löschen';
export const EJ_GROUP_WAY = 'Weg';
export const EJ_NO_WAY = 'Hier läuft kein Weg – Punkt ziehen setzt einen Wegpunkt.';
export const wayTextOf = (from: number, to: number, bent: boolean): string =>
  `${fineClockOf(from)}–${fineClockOf(to)} · ${bent ? 'gebogen' : 'gerade'}`;
export const EJ_STRAIGHTEN = 'Gerade ziehen';
export const EJ_GROUP_FACING = 'Blick am Ziel';
export const EJ_FACING = 'Blick';
export const EJ_FACING_LABEL = 'Blick am Ziel wählen';
export const EJ_COMPASS = 'Blick am Ziel wählen';
export const EJ_UNFACE = 'frei';
export const EJ_UNFACE_LABEL = 'Blick frei lassen';
const COMPASS_TEXT: Readonly<Record<number, string>> = {
  0: 'nach vorn',
  45: 'nach vorn rechts',
  90: 'nach rechts',
  135: 'nach hinten rechts',
  180: 'nach hinten',
  225: 'nach hinten links',
  270: 'nach links',
  315: 'nach vorn links',
};
export const compassTextOf = (point: number | null): string =>
  point === null ? EJ_UNFACE : (COMPASS_TEXT[point] ?? `${point}°`);
export const compassLabelOf = (point: number): string => `Blick ${compassTextOf(point)}`;

export const EJ_CAST_OWNER = 'Besetzung';
export const castTitleOf = (spots: number, held: number): string =>
  `${spots === 1 ? '1 Platz' : `${spots} Plätze`} · ${held} besetzt`;
export const EJ_SPOT_OWNER = 'Gewählter Platz';
export const spotTitleOf = (number: number, name: string | null): string =>
  `Platz ${number} · ${name ?? 'frei'}`;
export const EJ_GROUP_PERSON = 'Wer steht hier';
export const EJ_PICK_PERSON = 'Person wählen';
export const EJ_FREE = 'Frei lassen';
export const EJ_FREE_NAME = 'frei';
export const EJ_GROUP_SPOTS = 'Plätze';
export const EJ_ADD_SPOT = 'Neuer Platz';
export const EJ_ADD_SPOT_LABEL = 'Neuen Platz hinzufügen';
export const EJ_SPOT_DELETE = 'Platz löschen';
export const EJ_NOT_PLACED = 'nicht aufgestellt';
export const EJ_PICKED = 'gewählt';
export const spotRowLabelOf = (number: number, name: string | null): string =>
  `Platz ${number}, ${name ?? 'frei'}: wählen`;
const NO_SPOT_LEAD = '–';
export const EJ_HERE = 'hier';
export const castChoiceMetaOf = (choice: CastChoice): string => {
  switch (choice.kind) {
    case 'free':
      return 'noch ohne Platz';
    case 'here':
      return 'steht hier';
    case 'swap':
      return `tauschen mit ${choice.number}`;
  }
};
export const castLeadOf = (choice: CastChoice, here: number): string => {
  switch (choice.kind) {
    case 'free':
      return NO_SPOT_LEAD;
    case 'here':
      return String(here);
    case 'swap':
      return String(choice.number);
  }
};
export const castChoiceLabelOf = (
  first: string,
  last: string,
  spot: number,
  swapWith: number | null,
): string =>
  swapWith === null
    ? `${first} ${last} auf Platz ${spot} stellen`
    : `${first} ${last} von Platz ${swapWith} holen und Plätze tauschen`;
export const EJ_FREE_ALL = 'Alle frei lassen';
export const EJ_FREE_ALL_LABEL = 'Gewählte Plätze frei lassen';

export const EJ_FORMATION_START = 'Aufstellung am Anfang';
export const EJ_NO_SPOTS = 'Noch keine Plätze – unter Besetzung „Platz hinzufügen“.';
export const spotPlaceOf = (place: string | null, waypoints: number): string => {
  const keys = waypoints === 1 ? '1 Wegpunkt' : `${waypoints} Wegpunkte`;

  return place === null ? EJ_NOT_PLACED : `${place} · ${keys}`;
};
export const EJ_TRANSPORT = 'Wiedergabe';
export const EJ_PLAY = 'Abspielen';
export const EJ_PAUSE = 'Anhalten';
export const EJ_STEP_BACK = 'Voriger Schritt';
export const EJ_STEP_FORWARD = 'Nächster Schritt';
export const EJ_ZOOM = 'Zeitleiste zoomen';
export const EJ_ZOOM_IN = 'Näher';
export const EJ_ZOOM_OUT = 'Weiter weg';
export const EJ_FIT = 'Ganzer Auftritt';
export const EJ_UNDO = 'Rückgängig';
export const EJ_REDO = 'Wiederholen';
export const EJ_CARD_STAGE = 'Bühne bei diesem Schritt';
export const EJ_CARD_NAME = 'Name des Schritts';
export const EJ_CARDS_LIST = 'Schritte zum Wischen';
export const jobContextOf = (title: string, meta: string | null): string =>
  meta === null ? title : `${title} · ${meta}`;
export const EJ_FORMATION_START_CONTEXT = 'Aufstellung am Anfang';
export const spotShortOf = (number: number, name: string | null): string =>
  `Platz ${number}${name === null ? '' : ` · ${name}`}`;

export const EJ_REASON_TEXT: Record<JobReason, string> = {
  noMusic: 'Erst ein Lied hochladen',
  lastStep: 'Der letzte Schritt endet mit dem Lied',
  noSpots: 'Noch keine Plätze',
  sessionOnly: 'Nur in der Session',
  pickSpot: 'Erst einen Platz antippen',
  noWaypoint: 'Kein Wegpunkt an dieser Stelle',
  noWay: 'Kein Weg an dieser Stelle',
};

export const reasonLineOf = (reasons: readonly JobReason[]): string | null =>
  reasons.length === 0 ? null : reasons.map((reason) => EJ_REASON_TEXT[reason]).join(' · ');

export const EJ_CHIP_CLEAR = 'Abwählen';
export const chipCountOf = (count: number): string => spotsPickedOf(count);
export const chipAllOf = (count: number): string => `Alle ${count} Plätze`;
export const chipSpotOf = (number: number, name: string | null): string =>
  `Platz ${number} · ${name ?? EJ_FREE_NAME}`;
export const EJ_STAGE_TOOLS = 'Auswahl';

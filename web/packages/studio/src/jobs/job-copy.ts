import type { CastChoice, EditJob, JobReason } from '@furria/studio/job-model';
import { fineClockOf } from '@furria/studio/studio-copy';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';

const COUNTS_PER_EIGHT = 8;

export const JOB_PAGE_LABEL = 'Sessionsauftritt bearbeiten';
export const JOBS_LABEL = 'Was bearbeitest du?';

export const JOB_TEXT: Record<EditJob, string> = {
  steps: 'Schritte',
  formation: 'Aufstellung',
  movement: 'Bewegung',
  cast: 'Besetzung',
};

export const JOB_GLYPH: Record<EditJob, KkLaneGlyphName> = {
  steps: 'steps',
  formation: 'formation',
  movement: 'paths',
  cast: 'cast',
};

export const JOB_STAGE_HINT: Record<EditJob, string> = {
  steps: 'Bühne nur zum Ansehen',
  formation: 'Punkte ziehen · lange drücken wählt mehrere',
  movement: 'Punkt ziehen setzt einen Wegpunkt',
  cast: 'Platz antippen, dann Person wählen',
};

export const JOB_PICK_LINE: Record<EditJob, string> = {
  steps: '',
  formation: 'Plätze antippen oder Alle wählen',
  movement: 'Platz antippen – dann Weg und Blick',
  cast: 'Platz antippen – dann Person wählen',
};

export const JOB_STAGE = 'Bühne';
export const JOB_LANES = 'Zeitleiste: Teile, Musik, Schritte, Videos, Wegpunkte';
export const JOB_HEAD = 'Werkzeugleiste';
export const JOB_HISTORY_GROUP = 'Verlauf und Speichern';
export const JOB_LEAVE_GROUP = 'Bereiche';
export const JOB_HISTORY = 'Verlauf';
export const JOB_HISTORY_EMPTY = 'In diesem Besuch noch nichts geändert.';
export const JOB_HISTORY_LIST = 'Änderungen in diesem Besuch';
export const JOB_HISTORY_VISIT = 'In diesem Besuch';
export const JOB_VERSIONS = 'Gespeicherte Fassungen';
export const JOB_VERSIONS_NOTE =
  'Wiederherstellen gilt sofort für alle und lässt sich nicht mit Rückgängig zurücknehmen.';
export const JOB_VERSIONS_LOADING = 'Fassungen werden geladen …';
export const JOB_VERSION_RESTORE = 'Wiederherstellen';
export const JOB_VERSION_SURE = 'Wirklich wiederherstellen';
export const JOB_MUSIC_PAGE = 'Musik & Video';
export const JOB_DONE = 'Fertig';
export const JOB_DONE_LABEL = 'Fertig: Bearbeiten beenden';
export const JOB_MENU = 'Mehr';
export const JOB_MENU_TITLE = 'Weitere Bereiche';
export const JOB_MORE = 'Mehr …';
export const JOB_CLOSE = 'Schließen';
export const JOB_BACK = 'Zurück';
export const backToOf = (job: string): string => `Zurück zu ${job}`;
export const JOB_BAR_LABEL = 'Werkzeuge';
export const JOB_SURE = 'Wirklich löschen';
export const JOB_SURE_DISSOLVE = 'Wirklich auflösen';
export const JOB_EVENING_STEPS = 'An diesem Abend gelten die Schritte der Session – hier nur üben.';

export const jobHistoryTextOf = (count: number): string => `${JOB_HISTORY} · ${count}`;
export const jobMoreTitleOf = (job: EditJob): string => JOB_TEXT[job];

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

export const JOB_STEP_OWNER = 'Schritt';
export const JOB_NO_STEP = 'Noch keine Schritte';
export const JOB_NO_STEP_MUSIC = 'Erst ein Lied hochladen, dann Schritte setzen.';
export const JOB_NO_STEP_HINT =
  'Abspielen und an der richtigen Stelle „Ersten Schritt setzen“ tippen.';
export const JOB_GROUP_TEXT = 'Name und Beschreibung';
export const JOB_NAME = 'Name';
export const JOB_GROUP_LENGTH = 'Länge';
export const JOB_SHORTER = 'Ende früher';
export const JOB_SHORTER_LABEL = 'Ende eine Zählzeit früher';
export const JOB_LONGER = 'Ende später';
export const JOB_LONGER_LABEL = 'Ende eine Zählzeit später';
export const JOB_LAST_STEP = 'Der letzte Schritt endet mit dem Lied.';
export const JOB_GROUP_STEPS = 'Teilen';
export const JOB_MARK = 'Hier teilen';
export const JOB_MARK_LABEL = 'Schritt an der Abspielposition teilen';
export const JOB_FIRST_STEP = 'Ersten Schritt setzen';
export const JOB_FIRST_STEP_LABEL = 'Ersten Schritt an der Abspielposition setzen';
export const JOB_NEW_PART = 'Neuer Teil ab hier';
export const JOB_GROUP_PRACTICE = 'Üben';
export const JOB_LOOP_STEP = 'Schritt wiederholen';
export const JOB_LOOP_STEP_LABEL = 'Diesen Schritt immer wieder abspielen';
export const JOB_LOOP_PART = 'Teil wiederholen';
export const JOB_LOOP_PART_LABEL = 'Diesen Teil immer wieder abspielen';
export const tempoTextOf = (rate: string): string => `Tempo ${rate}`;
export const JOB_STEP_DELETE = 'Schritt löschen';

export const stepTitleOf = (number: number, name: string): string => `Schritt ${number} · ${name}`;
export const stepOwnerOf = (number: number, total: number): string =>
  `Schritt ${number} von ${total}`;
export const stepMetaOf = (start: number, end: number, counts: number): string =>
  `${fineClockOf(start)}–${fineClockOf(end)} · ${countLengthTextOf(counts)}`;

export const JOB_PART_OWNER = 'Teil';
export const JOB_PART_NAME = 'Name des Teils';
export const JOB_GROUP_PART_START = 'Beginn';
export const JOB_PART_EARLIER = 'Beginnt früher';
export const JOB_PART_LATER = 'Beginnt später';
export const JOB_GROUP_MAIN_VIDEO = 'Hauptvideo';
export const JOB_PART_DISSOLVE = 'Teil auflösen';
export const partMetaOf = (first: number, last: number, count: number): string =>
  `Schritt ${first}–${last} · ${count === 1 ? '1 Schritt' : `${count} Schritte`}`;

export const JOB_FORMATION_OWNER = 'Aufstellung';
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
export const JOB_GROUP_PRESET = 'Vorlage';
export const JOB_LINE = 'Linie';
export const JOB_CIRCLE = 'Kreis';
export const JOB_BLOCK = 'Block';
export const JOB_GROUP_ORDER = 'Ordnen';
export const JOB_MIRROR = 'Spiegeln';
export const JOB_ROW_ACROSS = 'Reihe quer';
export const JOB_ROW_ACROSS_LABEL = 'Quer in eine Reihe stellen und gleich verteilen';
export const JOB_ROW_DEEP = 'Reihe tief';
export const JOB_ROW_DEEP_LABEL = 'Hintereinander in eine Reihe stellen und gleich verteilen';
export const JOB_ROW_NEEDS_TWO = 'Reihe quer und Reihe tief ab 2 gewählten Plätzen.';
export const JOB_GROUP_COPY = 'Aufstellung übernehmen';
export const JOB_COPY_PREVIOUS = 'Anderen früheren Schritt wählen';
export const JOB_COPY_NEXT = 'Anderen späteren Schritt wählen';
export const copyTextOf = (number: number): string => `Wie Schritt ${number} übernehmen`;
export const copyLabelOf = (number: number, scope: string): string =>
  `Aufstellung von Schritt ${number} übernehmen · ${scope}`;
export const JOB_GROUP_SELECTION = 'Auswahl';
export const JOB_SELECT_ALL = 'Alle wählen';
export const JOB_SELECT_ALL_LABEL = 'Alle Plätze wählen';
export const JOB_GROUP_SHOW = 'Anzeige';
export const JOB_ONION = 'Vorige Aufstellung zeigen';

export const JOB_MOVEMENT_OWNER = 'Bewegung';
export const movementTitleOf = (place: string | null): string =>
  place === null ? 'Vor der Musik' : `Bei ${place}`;
export const movementContextOf = (place: string | null): string =>
  `Bewegung bei ${place ?? 'Musikbeginn'}`;
export const JOB_NO_SPOT_PICKED = 'Nichts gewählt';
export const spotsPickedOf = (count: number): string =>
  count === 1 ? '1 Platz gewählt' : `${count} Plätze gewählt`;
export const pickedTextOf = (count: number, total: number): string =>
  total > 1 && count >= total ? `Alle ${count} Plätze gewählt` : spotsPickedOf(count);
export const JOB_GROUP_WAYPOINT = 'Wegpunkt hier';
export const JOB_WAYPOINT_SET = 'gesetzt';
export const JOB_EARLIER = 'Früher';
export const JOB_LATER = 'Später';
export const JOB_WAYPOINT_EARLIER_LABEL = 'Wegpunkt eine Zählzeit früher';
export const JOB_WAYPOINT_LATER_LABEL = 'Wegpunkt eine Zählzeit später';
export const JOB_WAYPOINT_DELETE = 'Wegpunkt löschen';
export const JOB_GROUP_WAY = 'Weg';
export const JOB_NO_WAY = 'Hier läuft kein Weg – Punkt ziehen setzt einen Wegpunkt.';
export const wayTextOf = (from: number, to: number, bent: boolean): string =>
  `${fineClockOf(from)}–${fineClockOf(to)} · ${bent ? 'gebogen' : 'gerade'}`;
export const JOB_STRAIGHTEN = 'Gerade ziehen';
export const JOB_GROUP_FACING = 'Blick am Ziel';
export const JOB_FACING = 'Blick';
export const JOB_FACING_LABEL = 'Blick am Ziel wählen';
export const JOB_COMPASS = 'Blick am Ziel wählen';
export const JOB_UNFACE = 'frei';
export const JOB_UNFACE_LABEL = 'Blick frei lassen';
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
  point === null ? JOB_UNFACE : (COMPASS_TEXT[point] ?? `${point}°`);
export const compassLabelOf = (point: number): string => `Blick ${compassTextOf(point)}`;

export const JOB_CAST_OWNER = 'Besetzung';
export const castTitleOf = (spots: number, held: number): string =>
  `${spots === 1 ? '1 Platz' : `${spots} Plätze`} · ${held} besetzt`;
export const JOB_SPOT_OWNER = 'Gewählter Platz';
export const spotTitleOf = (number: number, name: string | null): string =>
  `Platz ${number} · ${name ?? 'frei'}`;
export const JOB_GROUP_PERSON = 'Wer steht hier';
export const JOB_PICK_PERSON = 'Person wählen';
export const JOB_FREE = 'Frei lassen';
export const JOB_FREE_NAME = 'frei';
export const JOB_GROUP_SPOTS = 'Plätze';
export const JOB_ADD_SPOT = 'Neuer Platz';
export const JOB_ADD_SPOT_LABEL = 'Neuen Platz hinzufügen';
export const JOB_SPOT_DELETE = 'Platz löschen';
export const JOB_NOT_PLACED = 'nicht aufgestellt';
export const JOB_PICKED = 'gewählt';
export const spotRowLabelOf = (number: number, name: string | null): string =>
  `Platz ${number}, ${name ?? 'frei'}: wählen`;
const NO_SPOT_LEAD = '–';
export const JOB_HERE = 'hier';
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
export const JOB_FREE_ALL = 'Alle frei lassen';
export const JOB_FREE_ALL_LABEL = 'Gewählte Plätze frei lassen';

export const JOB_FORMATION_START = 'Aufstellung am Anfang';
export const JOB_NO_SPOTS = 'Noch keine Plätze – unter Besetzung „Platz hinzufügen“.';
export const spotPlaceOf = (place: string | null, waypoints: number): string => {
  const keys = waypoints === 1 ? '1 Wegpunkt' : `${waypoints} Wegpunkte`;

  return place === null ? JOB_NOT_PLACED : `${place} · ${keys}`;
};
export const JOB_TRANSPORT = 'Wiedergabe';
export const JOB_PLAY = 'Abspielen';
export const JOB_PAUSE = 'Anhalten';
export const JOB_STEP_BACK = 'Voriger Schritt';
export const JOB_STEP_FORWARD = 'Nächster Schritt';
export const JOB_ZOOM = 'Zeitleiste zoomen';
export const JOB_ZOOM_IN = 'Näher';
export const JOB_ZOOM_OUT = 'Weiter weg';
export const JOB_FIT = 'Ganzer Auftritt';
export const JOB_UNDO = 'Rückgängig';
export const JOB_REDO = 'Wiederholen';
export const JOB_CARD_STAGE = 'Bühne bei diesem Schritt';
export const JOB_CARD_NAME = 'Name des Schritts';
export const JOB_CARDS_LIST = 'Schritte zum Wischen';
export const jobContextOf = (title: string, meta: string | null): string =>
  meta === null ? title : `${title} · ${meta}`;
export const JOB_FORMATION_START_CONTEXT = 'Aufstellung am Anfang';
export const spotShortOf = (number: number, name: string | null): string =>
  `Platz ${number}${name === null ? '' : ` · ${name}`}`;

export const JOB_REASON_TEXT: Record<JobReason, string> = {
  noMusic: 'Erst ein Lied hochladen',
  lastStep: 'Der letzte Schritt endet mit dem Lied',
  noSpots: 'Noch keine Plätze',
  sessionOnly: 'Nur in der Session',
  pickSpot: 'Erst einen Platz antippen',
  noWaypoint: 'Kein Wegpunkt an dieser Stelle',
  noWay: 'Kein Weg an dieser Stelle',
};

export const reasonLineOf = (reasons: readonly JobReason[]): string | null =>
  reasons.length === 0 ? null : reasons.map((reason) => JOB_REASON_TEXT[reason]).join(' · ');

export const JOB_CHIP_CLEAR = 'Abwählen';
export const chipCountOf = (count: number): string => spotsPickedOf(count);
export const chipAllOf = (count: number): string => `Alle ${count} Plätze`;
export const chipSpotOf = (number: number, name: string | null): string =>
  `Platz ${number} · ${name ?? JOB_FREE_NAME}`;
export const JOB_STAGE_TOOLS = 'Auswahl';

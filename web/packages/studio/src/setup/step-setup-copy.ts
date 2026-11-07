import type { SetupOpen } from '@furria/studio/setup-progress';
import type {
  SetupPlace,
  SetupStage,
  StageCellState,
  StageGate,
} from '@furria/studio/setup-stages';

export const SS_TITLE = 'Schritte einrichten';
export const SS_HEAD = 'Einrichten';
export const setupHeadingOf = (title: string, stage: string, wide: boolean): string =>
  wide ? `${title} · ${stage}` : stage;
export const SS_STAGES = 'Fortschritt der Einrichtung';
export const SS_BACK = 'Zurück';
export const SS_UNDO = 'Rückgängig';
export const SS_REDO = 'Wiederholen';
export const SS_SAVING = 'Speichert …';
export const SS_SAVE_FAILED = 'Nicht gespeichert';
export const SS_VIDEO_AREA = 'Video';
export const SS_PICTURE = 'Bild';
export const SS_MORE = 'Mehr Werkzeuge';
export const SS_SURE = 'Wirklich löschen';
export const SS_MORE_CLOSE = 'Schließen';
export const SS_TASK = 'Aufgabe';
export const SS_TRANSPORT = 'Abspielen';
export const SS_TRANSPORT_STEPS = 'Schritte';
export const SS_TRANSPORT_VIEW = 'Ansicht';
export const SS_TRANSPORT_PRACTICE = 'Üben';
export const SS_STEP_BACK = 'Voriger Schritt';
export const SS_STEP_FORWARD = 'Nächster Schritt';
export const SS_LOOP_STEP = 'Schritt wiederholen';
export const SS_LOOP_SHORT = 'Wiederholen';
export const tempoShortOf = (percent: number): string => `${percent} %`;
export const SS_ZOOM_IN = 'Näher heran';
export const SS_ZOOM_OUT = 'Weiter weg';
export const SS_FIT = 'Ganzes Lied';
export const SS_TIMELINE = 'Zeitleiste: Musik, Schritte und Video';

export const SS_STAGE_TEXT: Record<SetupPlace, string> = {
  video: 'Video',
  borders: 'Schritte trennen',
  names: 'Schritte benennen',
  finish: 'Geschafft',
};

const STAGE_SHORT: Record<SetupPlace, string> = {
  video: 'Video',
  borders: 'Trennen',
  names: 'Benennen',
  finish: 'Abschluss',
};

export const nextTextOf = (place: SetupPlace): string => `Weiter: ${STAGE_SHORT[place]}`;

const CELL_STATE_TEXT: Record<StageCellState, string> = {
  done: 'erledigt',
  open: 'offen',
  locked: 'noch nicht möglich',
};

export const stageCellLabelOf = (stage: SetupStage, state: StageCellState): string =>
  `${SS_STAGE_TEXT[stage]}: ${CELL_STATE_TEXT[state]}`;

export const SS_GATE_TEXT: Record<StageGate, string> = {
  open: '',
  noMusic: 'Erst ein Lied hochladen – ohne Musik gibt es keine Schritte.',
  noVideo: 'Wähle zuerst ein Video.',
  videoWaiting: 'Das Video wird noch vorbereitet.',
  notPlaced: 'Das Video braucht erst seine Stelle in der Musik.',
  noSteps: 'Tippe mindestens einmal „Schritt endet hier“.',
};

export const SS_MUSIC_PAGE = 'Musik hochladen';

export const SS_VIDEO_PICK = 'Wähle das Video, in dem du die Schritte tanzt.';
export const SS_VIDEO_UPLOAD = 'Video hochladen';
export const SS_VIDEO_LIST = 'Videos dieses Tanzes';
export const SS_VIDEO_EMPTY = 'Noch kein Video.';
export const SS_VIDEO_UNPLACED = 'noch ohne Stelle in der Musik';
export const SS_VIDEO_WAITING = 'wird vorbereitet …';
export const SS_VIDEO_FAILED = 'nicht lesbar';
export const SS_VIDEO_OTHER = 'Ändern';
export const SS_UPLOAD_FAILED = 'Hochladen fehlgeschlagen – tippen zum Entfernen';
export const uploadMetaOf = (share: number): string => `Lädt hoch · ${Math.round(share * 100)} %`;
export const videoMetaOf = (parts: readonly string[]): string => parts.join(' · ');
export const videoLengthOf = (clock: string): string => `${clock} lang`;
export const videoPlacedOf = (clock: string): string => `ab ${clock} in der Musik`;
export const videoStepCountOf = (count: number): string =>
  count === 1 ? '1 Schritt' : `${count} Schritte`;

export const SS_MATCH_SEARCHING = 'Sucht die passende Stelle in der Musik …';
export const SS_MATCH_CHECK = 'Passt der Takt? Spiel ab – sonst Video verschieben.';
export const SS_MATCH_MISSING =
  'Keine passende Stelle gefunden. Spiel die Musik bis zum Videoanfang und tippe „Video startet hier“.';
export const SS_MATCH_FAILED =
  'Die Suche ging nicht. Spiel die Musik bis zum Videoanfang und tippe „Video startet hier“.';
export const SS_MATCH_WAITING = 'Das Video wird noch vorbereitet – gleich geht es weiter.';
export const SS_EARLIER_BIG = '−1 s';
export const SS_EARLIER_SMALL = '−0,1 s';
export const SS_LATER_SMALL = '+0,1 s';
export const SS_LATER_BIG = '+1 s';
export const SS_EARLIER_BIG_LABEL = 'Video eine Sekunde früher';
export const SS_EARLIER_SMALL_LABEL = 'Video eine Zehntelsekunde früher';
export const SS_LATER_SMALL_LABEL = 'Video eine Zehntelsekunde später';
export const SS_LATER_BIG_LABEL = 'Video eine Sekunde später';
export const SS_START_HERE = 'Video startet hier';
export const SS_START_HERE_LABEL = 'Video an der Abspielstelle beginnen lassen';
export const SS_SEARCH_AGAIN = 'Takt neu suchen';

export const SS_TAP = 'Schritt endet hier';
export const SS_TAP_LABEL = 'Schrittende an der Abspielstelle setzen';
export const SS_TAP_HINT = 'Tippe beim Abspielen, wo ein Schritt endet.';
export const videoStepsOf = (count: number): string =>
  count === 1 ? '1 Schritt im Video' : `${count} Schritte im Video`;
export const SS_TUNE_GROUP = 'Schrittende anpassen';
export const SS_TUNE_NONE = 'Noch kein Schrittende gesetzt.';
export const tuneTitleOf = (number: number, clock: string): string =>
  `Ende von Schritt ${number} · ${clock}`;
export const SS_TUNE_EARLIER = 'Früher';
export const SS_TUNE_EARLIER_LABEL = 'Schrittende einen Schlag früher';
export const SS_TUNE_LATER = 'Später';
export const SS_TUNE_LATER_LABEL = 'Schrittende einen Schlag später';
export const SS_TUNE_PREVIOUS = 'Voriges Schrittende';
export const SS_TUNE_NEXT = 'Nächstes Schrittende';
export const SS_TUNE_DELETE = 'Schrittende löschen';

export const SS_NAMES_HINT = 'Gib jedem Schritt einen Namen, den die Gruppe kennt.';
export const SS_NAMES_LIST = 'Schritte aus diesem Video';
export const nameLabelOf = (number: number): string => `Name von Schritt ${number}`;

export const SS_PART_NAME = 'Name des Teils';
export const SS_PART_NEW = 'Neuer Teil ab hier';
export const SS_PART_DISSOLVE = 'Teil auflösen';
export const SS_PART_MIDDLE = 'Nur der erste oder letzte Schritt eines Teils kann hinaus.';
export const joinPartOf = (name: string): string => `Zu „${name}“`;
export const leavePartOf = (name: string): string => `Aus „${name}“ nehmen`;

export const finishSentenceOf = (count: number): string =>
  count === 1
    ? '1 Schritt aus diesem Video ist angelegt.'
    : `${count} Schritte aus diesem Video sind angelegt.`;
export const SS_FINISH_ROWS = 'Was noch offen ist';
export const SS_FINISH_OPEN = 'Öffnen';
export const SS_TO_DANCE = 'Zum Tanz';
export const SS_ANOTHER_VIDEO = 'Noch ein Video';
export const SS_ALL_NAMED = 'Alle benannt';
export const unnamedOf = (count: number): string =>
  count === 1 ? '1 Schritt ohne Namen' : `${count} Schritte ohne Namen`;

export const SS_OPEN_TEXT: Record<SetupOpen, (count: number, total: number) => string> = {
  nothing: () => 'Alles eingerichtet',
  names: (count, total) => `${count} von ${total} Schritten ohne Namen`,
};
export const SS_RESUME = 'Weiter einrichten';
export const SS_START_SETUP = 'Schritte einrichten';

export const SL_LIST = 'Schritte in der Reihenfolge der Musik';
export const SL_PART_EYEBROW = 'Teil';
export const slPartMetaOf = (first: number, last: number, count: number): string =>
  first === last ? `Schritt ${first}` : `Schritt ${first}–${last} · ${count} Schritte`;
export const slPartLabelOf = (name: string): string => `Teil ${name}: bearbeiten`;
export const SL_LOOSE = 'Schritte ohne Teil';
export const slRowLabelOf = (number: number, name: string): string =>
  `Schritt ${number}, ${name}: auswählen`;
export const slRowMetaOf = (clock: string, length: string): string => `${clock} · ${length}`;
export const SL_NO_FORMATION = 'ohne Aufstellung';
export const slPairLabelOf = (number: number): string =>
  `Aufstellung von Schritt ${number}: Anfang und Ende`;
export const SL_DETAIL = 'Schritt bearbeiten';
export const SL_NAME = 'Name';
export const SL_GROUP_STEP = 'Schritt';
export const SL_GROUP_PART = 'Teil';
export const SL_SPLIT = 'Teilen';
export const SL_SPLIT_LABEL = 'Schritt an der Abspielposition oder in der Mitte teilen';
export const SL_MERGE = 'Mit nächstem zusammenlegen';
export const SL_DELETE = 'Löschen';
export const SL_DELETE_NOTE = 'Die Zeit geht an den Schritt davor.';
export const SL_LOOP = 'Wiederholen';
export const SL_ADD = 'Schritt hinzufügen';
export const SL_ADD_LABEL = 'Neuen Schritt an der Abspielposition beginnen lassen';
export const SL_PART_DETAIL = 'Teil bearbeiten';
export const SL_PART_LOOP = 'Teil wiederholen';
export const SL_EMPTY = 'Noch keine Schritte.';
export const SL_EVENING = 'An diesem Abend gelten die Schritte der Session – hier nur üben.';
export const SL_SETUP_OWNER = 'Einrichtung';
export const stepGroupKeyOf = (partId: number): string => `part-${partId}`;
export const secondsLengthOf = (seconds: number): string =>
  `${seconds.toFixed(1).replace('.', ',')} s`;
export const SS_DENIED = 'Die Schritte dieses Auftritts kannst du nicht einrichten.';

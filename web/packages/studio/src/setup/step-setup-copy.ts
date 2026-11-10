import type { SetupOpen } from '@furria/studio/setup-progress';
import type {
  SetupPlace,
  SetupStage,
  StageCellState,
  StageGate,
} from '@furria/studio/setup-stages';

export const STEP_SETUP_TITLE = 'Schritte einrichten';
export const SETUP_HEAD = 'Einrichten';
export const setupHeadingOf = (title: string, stage: string, wide: boolean): string =>
  wide ? `${title} · ${stage}` : stage;
export const STEP_SETUP_PROGRESS = 'Fortschritt der Einrichtung';
export const SETUP_BACK = 'Zurück';
export const SETUP_UNDO = 'Rückgängig';
export const SETUP_REDO = 'Wiederholen';
export const SETUP_SAVING = 'Speichert …';
export const SETUP_SAVE_FAILED = 'Nicht gespeichert';
export const SETUP_VIDEO_AREA = 'Video';
export const SETUP_PICTURE = 'Bild';
export const SETUP_MORE = 'Mehr Werkzeuge';
export const SETUP_SURE = 'Wirklich löschen';
export const SETUP_MORE_CLOSE = 'Schließen';
export const SETUP_TASK = 'Aufgabe';
export const SETUP_TRANSPORT = 'Abspielen';
export const SETUP_TRANSPORT_STEPS = 'Schritte';
export const SETUP_TRANSPORT_VIEW = 'Ansicht';
export const SETUP_TRANSPORT_PRACTICE = 'Üben';
export const SETUP_STEP_BACK = 'Voriger Schritt';
export const SETUP_STEP_FORWARD = 'Nächster Schritt';
export const SETUP_LOOP_STEP = 'Schritt wiederholen';
export const SETUP_LOOP_SHORT = 'Wiederholen';
export const tempoShortOf = (percent: number): string => `${percent} %`;
export const SETUP_ZOOM_IN = 'Näher heran';
export const SETUP_ZOOM_OUT = 'Weiter weg';
export const SETUP_FIT = 'Ganzes Lied';
export const SETUP_TIMELINE = 'Zeitleiste: Musik, Schritte und Video';

export const SETUP_STAGE_TEXT: Record<SetupPlace, string> = {
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
  `${SETUP_STAGE_TEXT[stage]}: ${CELL_STATE_TEXT[state]}`;

export const SETUP_GATE_TEXT: Record<StageGate, string> = {
  open: '',
  noMusic: 'Erst ein Lied hochladen.',
  noVideo: 'Wähle zuerst ein Video.',
  videoWaiting: 'Das Video wird noch vorbereitet.',
  notPlaced: 'Das Video braucht erst seine Stelle in der Musik.',
  noSteps: 'Tippe mindestens einmal „Schritt endet hier“.',
};

export const SETUP_MUSIC_PAGE = 'Musik hochladen';

export const SETUP_VIDEO_PICK = 'Wähle das Video, in dem du die Schritte tanzt.';
export const SETUP_VIDEO_UPLOAD = 'Video hochladen';
export const SETUP_VIDEO_LIST = 'Videos dieses Tanzes';
export const SETUP_VIDEO_EMPTY = 'Noch kein Video.';
export const SETUP_VIDEO_UNPLACED = 'noch ohne Stelle in der Musik';
export const SETUP_VIDEO_WAITING = 'wird vorbereitet …';
export const SETUP_VIDEO_FAILED = 'nicht lesbar';
export const SETUP_VIDEO_OTHER = 'Ändern';
export const SETUP_UPLOAD_FAILED = 'Hochladen fehlgeschlagen – tippen zum Entfernen';
export const uploadMetaOf = (share: number): string => `Lädt hoch · ${Math.round(share * 100)} %`;
export const videoMetaOf = (parts: readonly string[]): string => parts.join(' · ');
export const videoLengthOf = (clock: string): string => `${clock} lang`;
export const videoPlacedOf = (clock: string): string => `ab ${clock} in der Musik`;
export const videoStepCountOf = (count: number): string =>
  count === 1 ? '1 Schritt' : `${count} Schritte`;

export const SETUP_MATCH_SEARCHING = 'Sucht die passende Stelle in der Musik …';
export const SETUP_MATCH_CHECK = 'Passt der Takt? Spiel ab – sonst Video verschieben.';
export const SETUP_MATCH_MISSING =
  'Keine passende Stelle gefunden. Spiel die Musik bis zum Videoanfang und tippe „Video startet hier“.';
export const SETUP_MATCH_FAILED =
  'Die Suche ging nicht. Spiel die Musik bis zum Videoanfang und tippe „Video startet hier“.';
export const SETUP_MATCH_WAITING = 'Das Video wird noch vorbereitet …';
export const SETUP_EARLIER_BIG = '−1 s';
export const SETUP_EARLIER_SMALL = '−0,1 s';
export const SETUP_LATER_SMALL = '+0,1 s';
export const SETUP_LATER_BIG = '+1 s';
export const SETUP_EARLIER_BIG_LABEL = 'Video eine Sekunde früher';
export const SETUP_EARLIER_SMALL_LABEL = 'Video eine Zehntelsekunde früher';
export const SETUP_LATER_SMALL_LABEL = 'Video eine Zehntelsekunde später';
export const SETUP_LATER_BIG_LABEL = 'Video eine Sekunde später';
export const SETUP_START_HERE = 'Video startet hier';
export const SETUP_START_HERE_LABEL = 'Video an der Abspielstelle beginnen lassen';
export const SETUP_SEARCH_AGAIN = 'Takt neu suchen';

export const SETUP_TAP = 'Schritt endet hier';
export const SETUP_TAP_LABEL = 'Schrittende an der Abspielstelle setzen';
export const SETUP_TAP_HINT = 'Tippe beim Abspielen, wo ein Schritt endet.';
export const videoStepsOf = (count: number): string =>
  count === 1 ? '1 Schritt im Video' : `${count} Schritte im Video`;
export const SETUP_TUNE_GROUP = 'Schrittende anpassen';
export const SETUP_TUNE_NONE = 'Noch kein Schrittende gesetzt.';
export const tuneTitleOf = (number: number, clock: string): string =>
  `Ende von Schritt ${number} · ${clock}`;
export const SETUP_TUNE_EARLIER = 'Früher';
export const SETUP_TUNE_EARLIER_LABEL = 'Schrittende einen Schlag früher';
export const SETUP_TUNE_LATER = 'Später';
export const SETUP_TUNE_LATER_LABEL = 'Schrittende einen Schlag später';
export const SETUP_TUNE_PREVIOUS = 'Voriges Schrittende';
export const SETUP_TUNE_NEXT = 'Nächstes Schrittende';
export const SETUP_TUNE_DELETE = 'Schrittende löschen';

export const SETUP_NAMES_HINT = 'Gib jedem Schritt einen Namen.';
export const SETUP_NAMES_LIST = 'Schritte aus diesem Video';
export const nameLabelOf = (number: number): string => `Name von Schritt ${number}`;

export const SETUP_PART_NAME = 'Name des Teils';
export const SETUP_PART_NEW = 'Neuer Teil ab hier';
export const SETUP_PART_DISSOLVE = 'Teil auflösen';
export const SETUP_PART_MIDDLE = 'Nur der erste oder letzte Schritt eines Teils kann hinaus.';
export const joinPartOf = (name: string): string => `Zu „${name}“`;
export const leavePartOf = (name: string): string => `Aus „${name}“ nehmen`;

export const finishSentenceOf = (count: number): string =>
  count === 1
    ? '1 Schritt aus diesem Video ist angelegt.'
    : `${count} Schritte aus diesem Video sind angelegt.`;
export const SETUP_FINISH_ROWS = 'Was noch offen ist';
export const SETUP_FINISH_OPEN = 'Öffnen';
export const SETUP_TO_DANCE = 'Zum Tanz';
export const SETUP_ANOTHER_VIDEO = 'Noch ein Video';
export const SETUP_ALL_NAMED = 'Alle benannt';
export const unnamedOf = (count: number): string =>
  count === 1 ? '1 Schritt ohne Namen' : `${count} Schritte ohne Namen`;

export const SETUP_OPEN_TEXT: Record<SetupOpen, (count: number, total: number) => string> = {
  nothing: () => 'Alles eingerichtet',
  names: (count, total) => `${count} von ${total} Schritten ohne Namen`,
};
export const SETUP_RESUME = 'Weiter einrichten';
export const SETUP_START_SETUP = 'Schritte einrichten';

export const STEP_LIST_LIST = 'Schritte in der Reihenfolge der Musik';
export const STEP_LIST_PART_EYEBROW = 'Teil';
export const stepListPartMetaOf = (first: number, last: number, count: number): string =>
  first === last ? `Schritt ${first}` : `Schritt ${first}–${last} · ${count} Schritte`;
export const stepListPartLabelOf = (name: string): string => `Teil ${name}: bearbeiten`;
export const STEP_LIST_LOOSE = 'Schritte ohne Teil';
export const stepListRowLabelOf = (number: number, name: string): string =>
  `Schritt ${number}, ${name}: auswählen`;
export const stepListRowMetaOf = (clock: string, length: string): string => `${clock} · ${length}`;
export const STEP_LIST_NO_FORMATION = 'ohne Aufstellung';
export const stepListPairLabelOf = (number: number): string =>
  `Aufstellung von Schritt ${number}: Anfang und Ende`;
export const STEP_LIST_DETAIL = 'Schritt bearbeiten';
export const STEP_LIST_NAME = 'Name';
export const STEP_LIST_GROUP_STEP = 'Schritt';
export const STEP_LIST_GROUP_PART = 'Teil';
export const STEP_LIST_SPLIT = 'Teilen';
export const STEP_LIST_SPLIT_LABEL = 'Schritt an der Abspielposition oder in der Mitte teilen';
export const STEP_LIST_MERGE = 'Mit nächstem zusammenlegen';
export const STEP_LIST_DELETE = 'Löschen';
export const STEP_LIST_DELETE_NOTE = 'Die Zeit geht an den Schritt davor.';
export const STEP_LIST_LOOP = 'Wiederholen';
export const STEP_LIST_ADD = 'Schritt hinzufügen';
export const STEP_LIST_ADD_LABEL = 'Neuen Schritt an der Abspielposition beginnen lassen';
export const STEP_LIST_PART_DETAIL = 'Teil bearbeiten';
export const STEP_LIST_PART_LOOP = 'Teil wiederholen';
export const STEP_LIST_EMPTY = 'Noch keine Schritte.';
export const STEP_LIST_SETUP_OWNER = 'Einrichtung';
export const stepGroupKeyOf = (partId: number): string => `part-${partId}`;
export const secondsLengthOf = (seconds: number): string =>
  `${seconds.toFixed(1).replace('.', ',')} s`;
export const SETUP_DENIED = 'Die Schritte dieses Auftritts kannst du nicht einrichten.';

import type { KkKeyListEntry } from '@furria/ui/KkKeyList';
import type { ForwardKind, Span } from './heute-board';

export const HEUTE_A_TITLE = 'Heute am Abend';
export const NOW_LABEL = 'Auf der Bühne';
export const NEXT_LABEL = 'Als Nächstes';
export const AFTER_LABEL = 'Danach';
export const STRIP_TITLE = 'Wer fehlt, wer springt ein';
export const NOW_SHORT = 'Jetzt';
export const ALL_THERE = 'Alle da';
export const MISSING_STATE = 'fehlt';
export const STANDS_IN_STATE = 'springt ein';
export const CALL_TITLE = 'Bitte rufen';
export const CALL_NONE = 'Niemand mehr zu rufen.';
export const FROM_STAGE = 'kommt von der Bühne';
export const KEYS_LABEL = 'Ablauf steuern';
export const BACK = 'Zurück';
export const BACK_LABEL = 'Einen Auftritt zurück';
export const CLOSE = 'Schließen';
export const HELP_TITLE = 'Tasten';
export const FOLLOWING = 'Du siehst mit — weitergeschaltet wird an der Regie.';
export const BEFORE_NAME = 'Gleich geht es los';
export const ENDED_NAME = 'Der Abend ist vorbei';
export const NO_MORE = 'Das war der letzte Auftritt';
export const NOTHING_NEXT = 'Nichts mehr danach';
export const ACTS_TONIGHT = 'Auftritte heute';
export const RUNNING_FOR = 'Min. auf der Bühne';
export const MINUTES_TOTAL = 'Minuten insgesamt';
export const EVENING_TOOK = 'Der Abend dauerte';
export const LOAD_FAILED_TITLE = 'Abend nicht geladen';
export const LOAD_FAILED_TEXT = 'Der Ablauf für heute konnte nicht geladen werden.';
export const RETRY = 'Nochmal laden';
export const EMPTY_TITLE = 'Noch kein Ablauf';
export const EMPTY_TEXT = 'Für diesen Abend steht noch kein Auftritt im Ablauf.';

export const HEUTE_KEYS: readonly KkKeyListEntry[] = [
  { id: 'forward', keys: ['Leertaste', 'Enter', '→'], action: 'Weiter zum nächsten Auftritt' },
  { id: 'back', keys: ['←'], action: 'Einen Auftritt zurück' },
];

const FORWARD_CAPTIONS: Record<ForwardKind, string> = {
  start: 'Abend starten',
  next: 'Weiter',
  end: 'Abend beenden',
  over: 'Beendet',
};

export const toForwardCaption = (kind: ForwardKind): string => FORWARD_CAPTIONS[kind];

export const toHeuteLabel = (title: string): string => `Heute: ${title}`;

export const toShortName = (firstName: string, lastName: string): string => {
  const [initial] = lastName.trim();

  return initial === undefined ? firstName : `${firstName} ${initial}.`;
};

export const toSpanText = ({ hours, minutes }: Span): string =>
  hours === 0 ? `${minutes} Min.` : `${hours} Std. ${minutes} Min.`;

export const toEveningRunning = (span: Span): string => `Abend läuft seit ${toSpanText(span)}`;

export const toEveningTook = (span: Span): string => `${EVENING_TOOK} ${toSpanText(span)}`;

export const toStageMeta = (groupName: string | null, span: Span): string =>
  groupName === null
    ? `${NOW_LABEL} · ${toEveningRunning(span)}`
    : `${groupName} · ${toEveningRunning(span)}`;

export const toRunningLabel = (minutes: number): string =>
  minutes === 1 ? 'Seit 1 Minute auf der Bühne' : `Seit ${minutes} Minuten auf der Bühne`;

export const toActsTonightLabel = (count: number): string => `${count} Auftritte heute`;

export const toLineMeta = (groupName: string | null, castCount: number): string => {
  const cast = castCount === 1 ? '1 Person' : `${castCount} Personen`;

  return groupName === null ? cast : `${groupName} · ${cast}`;
};

export const toCallHead = (label: string, actName: string): string => `${label} · ${actName}`;

export const toStageCall = (name: string): string => `${name} · ${FROM_STAGE}`;

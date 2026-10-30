import type { KkChipTone } from '@furria/ui/KkChip';
import type { EveningChoreographyState } from '@/features/act-studio/studio-evening';
import { EVENING_CHANGE_WORDS } from '@/features/running-order/planner-copy';
import type { EveningChange } from '@/features/running-order/schemas';
import { toStageTime } from '@/features/running-order/stage-time';
import type { EveningEntryState } from './act-evenings';
import type { StudioEvening } from './schemas';

export const EVENINGS_TITLE = 'Abende';
export const EVENINGS_NOTE = 'Wo die Gruppe den Auftritt zeigt. Musik und Schritte bleiben gleich.';
export const EVENINGS_EMPTY = 'In dieser Session steht kein Abend mehr an.';
export const DANCE_HERE = 'Wir tanzen hier';
export const EVENING_CHANGED_HINT = 'angepasst';
export const EVENING_PANE_LABEL = 'Abend anpassen';
export const EVENING_CAST_TITLE = 'Besetzung an diesem Abend';
export const EVENING_CAST_LABEL = 'Wer an diesem Abend tanzt';
export const EVENING_ADD_LABEL = 'Ersatz dazunehmen';
export const EVENING_ADD_DONE = 'Fertig';
export const EVENING_FORMATION_TITLE = 'Aufstellung';
export const EVENING_FORMATION_EDIT = 'Für diesen Abend anpassen';
export const EVENING_FORMATION_RESET = 'Wieder wie in der Session';
export const EVENING_FORMATION_RESET_SURE = 'Eigene Aufstellung verwerfen?';
export const EVENING_PRACTISE = 'Diese Fassung üben';
export const EVENING_LEAVE = 'Wir tanzen hier nicht';
export const EVENING_LEAVE_SURE = 'Wirklich abmelden?';
export const EVENING_PLACED_NOTE =
  'Der Auftritt steht im Ablauf dieses Abends. Herausnehmen kann ihn nur die Planung.';

const DAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Berlin',
});

const STATE_LINES: Record<EveningEntryState, string> = {
  open: 'noch nicht angemeldet',
  joined: 'angemeldet, noch nicht im Ablauf',
  placed: 'steht im Ablauf',
};

export interface EveningStateChip {
  label: string;
  tone: KkChipTone;
}

const STATE_CHIPS: Record<EveningEntryState, EveningStateChip> = {
  open: { label: 'nicht angemeldet', tone: 'neutral' },
  joined: { label: 'noch offen', tone: 'neutral' },
  placed: { label: 'im Ablauf', tone: 'green' },
};

const FORMATION_LINES: Record<EveningChoreographyState, string> = {
  session: 'Wie in der Session. Was dort geändert wird, gilt auch an diesem Abend.',
  own: 'Eigene Aufstellung für diesen Abend.',
  behind:
    'Eigene Aufstellung für diesen Abend. Die Aufstellung der Session wurde seither geändert und kommt hier nicht an.',
};

export const toEveningDay = (startsAt: string): string => DAY.format(new Date(startsAt));

export const toEveningLabel = (evening: StudioEvening): string =>
  `${evening.title}, ${toEveningDay(evening.startsAt)}`;

const toStagePlace = (position: number, stageStartsAt: string | null): string =>
  stageStartsAt === null
    ? `Platz ${position + 1}`
    : `Platz ${position + 1} · ${toStageTime(position, stageStartsAt)}`;

export const toEveningMeta = (evening: StudioEvening): string => {
  const day = toEveningDay(evening.startsAt);
  const position = evening.appearance?.position ?? null;

  return position === null
    ? day
    : `${day} · ${toStagePlace(position, evening.appearance?.stageStartsAt ?? null)}`;
};

export const toEveningStateChip = (state: EveningEntryState): EveningStateChip =>
  STATE_CHIPS[state];

export const toEveningStateLine = (state: EveningEntryState): string => STATE_LINES[state];

const changeWordsOf = (changes: readonly EveningChange[]): string =>
  changes.map((change) => EVENING_CHANGE_WORDS[change]).join(', ');

export const toEveningChangesLine = (changes: readonly EveningChange[]): string | null =>
  changes.length === 0 ? null : `Für diesen Abend angepasst: ${changeWordsOf(changes)}.`;

export const toEveningLeaveLoss = (changes: readonly EveningChange[]): string | null =>
  changes.length === 0
    ? null
    : `Beim Abmelden geht verloren, was ihr für diesen Abend angepasst habt: ${changeWordsOf(changes)}.`;

export const toFormationLine = (state: EveningChoreographyState): string => FORMATION_LINES[state];

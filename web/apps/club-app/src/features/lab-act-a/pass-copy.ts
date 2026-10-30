import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkPassAnswer } from '@furria/ui/KkPassCard';
import { toEveningDay } from '@/features/acts/act-evenings-copy';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { toHubMetaFacts } from '@/features/group-hub/group-hub-labels';
import type { GroupHub } from '@/features/group-hub/schemas';
import { toGroupKindLabel } from '@/features/groups/groups-labels';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import type { ActKind } from '@/features/running-order/schemas';
import { toStageTime } from '@/features/running-order/stage-time';
import { formatSessionLabel } from '@/lib/membership-labels';
import type { PassCastRole, PassSlot, PassTraining } from './pass-act';
import type { PassScheduleCounts } from './pass-details';

export const NEXT_EVENING_EYEBROW = 'Nächster Auftritt';
export const NUMBER_LABEL = 'Nr.';
export const PENDING_LABEL = 'noch offen';
export const NO_EVENING_LABEL = 'Auftritt';
export const NO_EVENING_VALUE = 'keiner geplant';
export const NEXT_TRAINING_EYEBROW = 'Nächstes Training';
export const OWED_TRAINING_EYEBROW = 'Training · Antwort fehlt';
export const NO_TRAINING_LABEL = 'Training';
export const NO_TRAINING_VALUE = 'keins angesetzt';
export const PRACTICE_LABEL = 'Üben';
export const TEXT_LABEL = 'Text';
export const TEXT_VALUE = 'kommt noch';
export const OWN_LABEL = 'du';
export const CAST_EMPTY = 'noch niemand';
export const DETAILS_LABEL = 'Details';
export const CLOSE_LABEL = 'Schließen';
export const LATER_EVENINGS_TITLE = 'Weitere Auftritte';
export const LATER_TRAININGS_TITLE = 'Weitere Trainings';
export const ACT_FALLBACK_TITLE = 'Auftritt';
export const GROUP_FALLBACK_TITLE = 'Gruppe';
export const GROUP_ACTS_TITLE = 'Auftritte';
export const GROUP_OTHER_ACTS_TITLE = 'Weitere Auftritte der Gruppe';
export const GROUP_ACTS_EMPTY = 'Diese Session hat die Gruppe keine Auftritte.';
export const GROUP_HUB_LINK = 'Zur Gruppe';
export const GROUP_DENIED_MESSAGE = 'Diese Gruppe sehen ihre Mitglieder und die Vereinsleitung.';
export const GROUP_HUB_LINK_META = 'Termine, Leute, Trainingsrhythmus';
export const STATS_LABEL = 'Stand';
export const CO_EDITORS_LABEL = 'Bearbeiten mit';
export const WISHES_LABEL = 'Wünsche an den Ablauf';
export const SESSION_LABEL = 'Session';
export const NONE = 'keine';
export const POINT_EVENING_LABEL = 'Im Ablauf';
export const ACT_LOAD_FAILED = 'Der Auftritt lässt sich gerade nicht laden.';
export const GROUP_LOAD_FAILED = 'Die Auftritte lassen sich gerade nicht laden.';

export const OWED_ANSWER_LABEL = 'Antworten';
const OTHER_ACT_META = 'du bist nicht dabei';
const NO_ANSWERS_YET = 'noch keine Antworten';
const OWN_SPOT_LABEL = 'dein Platz';
const PENDING_STAMP = 'offen';
const NOT_PLACED_META = 'angemeldet, noch nicht im Ablauf';
const PLACED_META = 'steht im Ablauf';

export const ANSWER_LABELS: Record<KkPassAnswer, string> = { yes: 'Bin da', no: 'Kann nicht' };

const CAST_ROLE_LABELS: Record<PassCastRole, string> = {
  cast: 'Besetzung',
  speakers: 'Sprecher',
  performers: 'Mitwirkende',
};

const ANSWER_MARKS: Record<AttendanceAnswer, string> = {
  yes: 'Du bist da',
  no: 'Du kannst nicht',
  maybe: 'Du weißt es noch nicht',
};

const CLOCK = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});

const SHORT_DAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Berlin',
});

const SEPARATOR = ' · ';

export const toCastRoleLabel = (role: PassCastRole): string => CAST_ROLE_LABELS[role];

export const toClock = (instant: string): string => CLOCK.format(new Date(instant));

export const toShortDay = (instant: string): string => SHORT_DAY.format(new Date(instant));

export const toDayAndClock = (instant: string): string =>
  `${toShortDay(instant)}${SEPARATOR}${toClock(instant)}`;

export const toEveningWhen = (startsAt: string): string =>
  `${toEveningDay(startsAt)}${SEPARATOR}Beginn ${toClock(startsAt)}`;

export const toSlotTime = (position: number, stageStartsAt: string | null): string | null =>
  stageStartsAt === null ? null : toStageTime(position, stageStartsAt);

export const toPlaceNumber = (position: number): string => String(position + 1);

export const toPlaceLabel = (position: number | null, stageStartsAt: string | null): string => {
  if (position === null) {
    return PENDING_LABEL;
  }

  const place = `${NUMBER_LABEL} ${toPlaceNumber(position)}`;

  return stageStartsAt === null
    ? place
    : `${place}${SEPARATOR}${toStageTime(position, stageStartsAt)}`;
};

export const toPointLine = (slot: Exclude<PassSlot, { kind: 'none' }>): string => {
  const place =
    slot.kind === 'placed' ? toPlaceLabel(slot.position, slot.stageStartsAt) : PENDING_LABEL;

  return `${slot.title}${SEPARATOR}${toShortDay(slot.startsAt)}${SEPARATOR}${place}`;
};

export const toTrainingLineLabel = (title: string, startsAt: string): string =>
  `${title}, ${toShortDay(startsAt)}, ${toClock(startsAt)} Uhr`;

export const toEveningLineLabel = (
  title: string,
  startsAt: string,
  position: number | null,
  stageStartsAt: string | null,
): string => `${title}, ${toShortDay(startsAt)}, ${toPlaceLabel(position, stageStartsAt)}`;

export const toEveningStamp = (position: number | null): string =>
  position === null ? PENDING_STAMP : `${NUMBER_LABEL} ${toPlaceNumber(position)}`;

export const toEveningLineMeta = (
  position: number | null,
  stageStartsAt: string | null,
): string => {
  if (position === null) {
    return NOT_PLACED_META;
  }

  return stageStartsAt === null ? PLACED_META : toStageTime(position, stageStartsAt);
};

const joinNames = (names: readonly string[]): string => {
  if (names.length <= 1) {
    return names.join('');
  }

  return `${names.slice(0, -1).join(', ')} oder ${names.at(-1) ?? ''}`;
};

export const toSilentPracticeHint = (askNames: readonly string[]): string =>
  askNames.length === 0 ? 'Noch keine Musik.' : `Noch keine Musik — frag ${joinNames(askNames)}.`;

export const toTally = (present: number, absent: number): string =>
  present === 0 && absent === 0 ? NO_ANSWERS_YET : `${present} da${SEPARATOR}${absent} nicht`;

export const toTrainingTitle = (training: PassTraining): string | undefined =>
  training.kind === 'none' || training.title === NO_TRAINING_LABEL ? undefined : training.title;

export const toAnswerMarkLabel = (answer: AttendanceAnswer): string => ANSWER_MARKS[answer];

export const toActMeta = (
  kind: ActKind | null,
  groupName: string | null,
  ownSpot: number | null,
): string => {
  const parts = [
    kind === null ? null : toActKindLabel(kind),
    groupName,
    ownSpot === null ? null : `${OWN_SPOT_LABEL} ${NUMBER_LABEL} ${ownSpot}`,
  ].filter((part): part is string => part !== null);

  return parts.join(SEPARATOR);
};

export const toSessionLabel = (sessionYear: number): string =>
  `${SESSION_LABEL} ${formatSessionLabel(sessionYear)}`;

export interface PassScheduleFact {
  key: string;
  label: string;
  value: string;
  icon: KkIconName;
}

const withAside = (value: number, aside: number, label: string): string =>
  aside === 0 ? String(value) : `${value}${SEPARATOR}${aside} ${label}`;

export const toScheduleFacts = (counts: PassScheduleCounts): PassScheduleFact[] => [
  {
    key: 'evenings',
    label: 'Abende im Ablauf',
    value: withAside(counts.placed, counts.joined, 'noch offen'),
    icon: 'stage',
  },
  {
    key: 'trainings',
    label: 'Trainings',
    value: withAside(counts.trainings, counts.openSpots, 'Plätze offen'),
    icon: 'calendar',
  },
];

export const toGroupMeta = (hub: GroupHub): string =>
  [toGroupKindLabel(hub.groupKindName), ...toHubMetaFacts(hub)]
    .filter((part): part is string => part !== null)
    .join(SEPARATOR);

export const toOtherActMeta = (kind: ActKind | null): string =>
  kind === null ? OTHER_ACT_META : `${toActKindLabel(kind)}${SEPARATOR}${OTHER_ACT_META}`;

export const toCastCount = (count: number): string => String(count);

export const toAnswerLabel = (actName: string): string => `Deine Antwort zum Training (${actName})`;

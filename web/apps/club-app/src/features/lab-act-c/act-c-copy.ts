import { toHubMetaFacts } from '@/features/group-hub/group-hub-labels';
import type { GroupHub } from '@/features/group-hub/schemas';
import { toGroupKindLabel } from '@/features/groups/groups-labels';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import type { ActKind } from '@/features/running-order/schemas';
import { toStageTime } from '@/features/running-order/stage-time';
import type {
  ActTemplate,
  AnswerKey,
  Ask,
  DoorKey,
  EveningSlot,
  NamesPreview,
  StudioCounts,
  Tally,
} from './act-c-model';
import { musicClockOf } from './act-c-model';
import type { CastRole } from './cast-rows';

export const LAB_ORIGIN_LABEL = 'Labor';
export const CLOSE_LABEL = 'Schließen';
export const DETAILS_TITLE = 'Details';
export const ANSWER_YES = 'Bin da';
export const ANSWER_NO = 'Kann nicht';
export const NONE = 'keine';
export const NO_EVENING = 'Kein Abend geplant';
export const NO_TRAINING = 'Kein Training geplant';
export const NO_MUSIC = 'Noch keine Musik';
export const UNPLACED = 'noch ohne Nr.';
export const NOT_THERE = 'nicht dabei';
export const TEXT_SOON = 'kommt noch';
export const TEXT_SOON_LINE = 'Hier steht später der Text zum Auftritt.';
export const PLAYER_HINT = 'Musik, Schritte und Aufstellung';
export const OUTSIDE_NOTE = 'Die Einzelheiten sehen nur die Besetzung und die Gruppen-Admins.';
export const EDITORS_TITLE = 'Mitbearbeitung';
export const WISHES_TITLE = 'Wünsche';
export const SESSION_TITLE = 'Session';
export const MUSIC_TITLE = 'Musik';
export const STEPS_TITLE = 'Schritte';
export const SPOTS_TITLE = 'Plätze';
export const VIDEOS_TITLE = 'Videos';
export const STUDIO_OPEN = 'Im Studio öffnen';
export const SETTINGS_OPEN = 'Einstellungen öffnen';
export const LEAD_LABEL = 'Gruppen-Admin';
export const EDITOR_LABEL = 'bearbeitet mit';
export const GROUP_ACTS_TITLE = 'Auftritte';
export const OTHER_ACTS_TITLE = 'Weitere Auftritte der Gruppe';
export const HUB_REST_TITLE = 'Alles zur Gruppe';
export const HUB_REST_META = 'Mitglieder, Trainingszeiten, Termine';
export const HUB_EMPTY = 'Diese Gruppe hat in dieser Session noch keine Auftritte.';
export const ACT_NOT_FOUND = 'Diesen Auftritt gibt es nicht.';

const DOOR_LABELS: Record<DoorKey, string> = {
  evening: 'Abend',
  training: 'Training',
  practice: 'Üben',
  cast: 'Besetzung',
  text: 'Text',
};

const SHEET_TITLES: Record<DoorKey, string> = {
  evening: 'Alle Abende',
  training: 'Alle Trainings',
  practice: 'Üben',
  cast: 'Besetzung',
  text: 'Text',
};

const DOOR_HINTS: Record<DoorKey, string> = {
  evening: 'alle Abende zeigen',
  training: 'alle Trainings zeigen',
  practice: 'Player öffnen',
  cast: 'alle Namen zeigen',
  text: '',
};

const CAST_LABELS: Record<ActTemplate, string> = {
  studio: 'Besetzung',
  spoken: 'Sprecher',
  point: 'Besetzung',
};

const CLOCK = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});

const DATE = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Berlin',
});

const WEEKDAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  timeZone: 'Europe/Berlin',
});

const MUSIC_SPEAKING_KINDS = new Set(['music']);

export const toDoorLabel = (door: DoorKey, template: ActTemplate, kind: string | null): string => {
  if (door !== 'cast') {
    return DOOR_LABELS[door];
  }

  return kind !== null && MUSIC_SPEAKING_KINDS.has(kind) ? 'Mitwirkende' : CAST_LABELS[template];
};

export const toSheetTitle = (door: DoorKey, castLabel: string): string =>
  door === 'cast' ? castLabel : SHEET_TITLES[door];

export const toDoorHint = (door: DoorKey): string => `: ${DOOR_HINTS[door]}`;

export const toSheetId = (door: DoorKey): string => `act-c-${door}`;

const stripDot = (value: string): string => value.replace('.', '');

export const toDateFigure = (startsAt: string): string => DATE.format(new Date(startsAt));

export const toWeekdayClock = (startsAt: string): string =>
  `${stripDot(WEEKDAY.format(new Date(startsAt)))} · ${CLOCK.format(new Date(startsAt))}`;

export const toDayLine = (startsAt: string): string =>
  `${stripDot(WEEKDAY.format(new Date(startsAt)))} ${DATE.format(new Date(startsAt))}`;

export const toSlotFigure = (slot: EveningSlot, startsAt: string | null): string => {
  if (slot.kind === 'placed') {
    return `Nr. ${slot.number}`;
  }

  return startsAt === null ? '–' : toDateFigure(startsAt);
};

export const toSlotAside = (slot: EveningSlot): string => {
  if (slot.kind === 'unplaced') {
    return UNPLACED;
  }
  if (slot.kind === 'absent') {
    return NOT_THERE;
  }

  return slot.stageStartsAt === null ? '' : toStageTime(slot.stagePosition, slot.stageStartsAt);
};

export const toMoreEvenings = (count: number): string | null => {
  if (count <= 0) {
    return null;
  }

  return count === 1 ? '+1 weiterer Abend' : `+${count} weitere Abende`;
};

export const toTallyLine = (tally: Tally | null): string | null =>
  tally === null ? null : `${tally.present} von ${tally.of} da`;

export const toTallyMeta = (tally: Tally | null): string =>
  tally === null ? 'noch keine Antworten' : `${tally.present} da · ${tally.absent} nicht`;

export const toNamesLine = (preview: NamesPreview): string =>
  preview.more === 0 ? preview.names.join(', ') : `${preview.names.join(', ')} +${preview.more}`;

export const toPeopleCount = (count: number): string => (count === 1 ? 'Person' : 'Personen');

export const toAskLine = (ask: Ask): string => {
  if (ask.kind === 'self') {
    return 'Du kannst sie im Studio hinzufügen';
  }
  if (ask.kind === 'nobody') {
    return 'Noch niemand zuständig';
  }

  const head = ask.names.slice(0, -1);
  const last = ask.names.at(-1) ?? '';

  return head.length === 0 ? `Frag ${last}` : `Frag ${head.join(', ')} oder ${last}`;
};

const CLOCK_ONLY = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});

export const toClockLine = (startsAt: string): string =>
  `${CLOCK_ONLY.format(new Date(startsAt))} Uhr`;

export const toMoreTrainings = (count: number): string | null => {
  if (count <= 0) {
    return null;
  }

  return count === 1 ? '+1 weiteres Training' : `+${count} weitere Trainings`;
};

export const toPracticeFacts = (counts: StudioCounts): string =>
  `${counts.steps} Schritte · ${counts.parts.length} Teile`;

export const toPartsLine = (parts: readonly string[]): string => parts.join(' · ');

export const toMusicFigure = (seconds: number): string => musicClockOf(seconds);

export const toMusicSource = (counts: StudioCounts): string =>
  counts.finalTrack ? 'Endfassung' : `Arbeitsmix · ${counts.songs} Lieder`;

export const toStepsMeta = (counts: StudioCounts): string =>
  `${counts.placedSteps} auf der Musik · ${counts.parts.length} Teile`;

export const toSpotsMeta = (counts: StudioCounts): string =>
  counts.openSpots === 0 ? 'alle besetzt' : `${counts.openSpots} offen`;

export const toVideosMeta = (counts: StudioCounts): string =>
  counts.outdatedVideos === 0 ? 'alle aktuell' : `${counts.outdatedVideos} veraltet`;

export const toSessionLine = (sessionYear: number): string =>
  `Session ${sessionYear}/${String((sessionYear + 1) % 100).padStart(2, '0')}`;

export const toCountLine = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

const CAST_ROLE_METAS: Record<CastRole, string | undefined> = {
  self: 'du',
  editor: 'bearbeitet mit',
  member: undefined,
};

export const toCastRoleMeta = (role: CastRole): string | undefined => CAST_ROLE_METAS[role];

export const headerFactsOf = (
  kind: ActKind | null,
  sessionYear: number | null,
  afterGroup: boolean,
): string => {
  const parts = [
    kind === null ? null : toActKindLabel(kind),
    sessionYear === null ? null : toSessionLine(sessionYear),
  ].filter((part): part is string => part !== null);

  const line = parts.join(' · ');

  return afterGroup && line !== '' ? ` · ${line}` : line;
};

const ANSWER_LINES: Record<AnswerKey, string> = { yes: ANSWER_YES, no: ANSWER_NO };

export const toAnswerLine = (owed: boolean, answer: AnswerKey | null): string => {
  if (owed) {
    return 'Antwort fehlt';
  }

  return answer === null ? '' : ANSWER_LINES[answer];
};

export const toSlotLine = (slot: EveningSlot, startsAt: string | null): string => {
  const aside = toSlotAside(slot);
  const figure = toSlotFigure(slot, startsAt);

  return aside === '' ? figure : `${figure} · ${aside}`;
};

export const PRACTICE_READY = 'Musik ist da';

export const toHubActMeta = (kind: ActKind | null, castSize: number): string => {
  const people = `${castSize} ${toPeopleCount(castSize)}`;

  return kind === null ? people : `${toActKindLabel(kind)} · ${people}`;
};

export const toGroupHeaderLine = (hub: GroupHub): string =>
  [toGroupKindLabel(hub.groupKindName), ...toHubMetaFacts(hub)]
    .filter((part): part is string => part !== null)
    .join(' · ');

export const toActTitle = (name: string | undefined): string => name ?? 'Auftritt';

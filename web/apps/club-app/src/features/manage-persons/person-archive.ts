import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { toActLine } from '@/lib/act-line';
import { sessionAt } from '@/lib/club';
import { fromIsoDay, shiftDay } from '@/lib/day';
import { formatIsoDay, formatSessionSpan, toMembershipStateLabel } from '@/lib/membership-labels';
import { toPersonName } from './manage-persons-labels';
import type { PersonArchive, PersonDetails, PersonMembership, PersonPause } from './schemas';

export type RunningTie =
  | { kind: 'membership' }
  | { kind: 'group' | 'role' | 'groupAdmin' | 'boardSeat' | 'keyHolding'; name: string };

type NamedTieKind = Exclude<RunningTie['kind'], 'membership'>;

type TiedPerson = Pick<
  PersonDetails,
  | 'memberships'
  | 'groups'
  | 'roles'
  | 'unendedGroupAdminTenures'
  | 'unendedBoardSeats'
  | 'unendedKeyHoldings'
>;

const TIE_LABELS: Record<RunningTie['kind'], string> = {
  membership: 'Mitgliedschaft',
  group: 'Gruppe',
  role: 'Rolle',
  groupAdmin: 'Gruppen-Admin',
  boardSeat: 'Vorstandssitz',
  keyHolding: 'Schlüssel',
};

const TIE_SEPARATOR = ' · ';

const isUnended = (endsOn: string | null, todayIsoDay: string): boolean =>
  endsOn === null || endsOn >= todayIsoDay;

const toNamedTies = (kind: NamedTieKind, names: readonly string[]): RunningTie[] =>
  [...new Set(names)].map((name) => ({ kind, name }));

export const toRunningTies = (person: TiedPerson, todayIsoDay: string): RunningTie[] => {
  const membership: RunningTie[] = person.memberships.some((entry) =>
    isUnended(entry.endedOn, todayIsoDay),
  )
    ? [{ kind: 'membership' }]
    : [];
  const groups = person.groups
    .filter((group) => isUnended(group.leftOn, todayIsoDay))
    .map((group) => group.name);
  const roles = person.roles
    .filter((role) => isUnended(role.untilOn, todayIsoDay))
    .map((role) => role.name);

  return [
    ...membership,
    ...toNamedTies('group', groups),
    ...toNamedTies('role', roles),
    ...toNamedTies(
      'groupAdmin',
      person.unendedGroupAdminTenures.map((tenure) => tenure.name),
    ),
    ...toNamedTies(
      'boardSeat',
      person.unendedBoardSeats.map((seat) => seat.name),
    ),
    ...toNamedTies(
      'keyHolding',
      person.unendedKeyHoldings.map((holding) => holding.name),
    ),
  ];
};

const toTieLabel = (tie: RunningTie): string =>
  tie.kind === 'membership' ? TIE_LABELS.membership : `${TIE_LABELS[tie.kind]} ${tie.name}`;

export const toRunningTiesList = (ties: readonly RunningTie[]): string =>
  ties.map(toTieLabel).join(TIE_SEPARATOR);

const ARCHIVED_ACT = 'Archiviert';

export const toArchiveNote = (
  archive: PersonArchive | null,
  viewerPersonId: number | null,
  today: Date,
): string | null =>
  archive === null
    ? null
    : toActLine(
        ARCHIVED_ACT,
        archive.archivedBy,
        viewerPersonId,
        fromIsoDay(archive.archivedOn),
        today,
      );

export type ClosedHistoryRecords =
  | 'beendete Mitgliedschaften'
  | 'Ruhezeiten'
  | 'Beitragsermäßigungen';

export const toClosedHistoryLine = (firstName: string, records: ClosedHistoryRecords): string =>
  `${firstName} ist archiviert – ${records} lassen sich erst nach dem Wiederherstellen festhalten.`;

export type MembershipArchiveEffect = 'untouched' | 'lifted' | 'refused';

export const toMembershipArchiveEffect = (
  isArchived: boolean,
  endedOn: string | null,
  todayIsoDay: string,
): MembershipArchiveEffect => {
  if (!isArchived) {
    return 'untouched';
  }

  return isUnended(endedOn, todayIsoDay) ? 'lifted' : 'refused';
};

export const toArchiveLiftedSentence = (firstName: string): string =>
  `${firstName} ist damit nicht mehr archiviert.`;

export const ARCHIVE_PERSON_LABEL = 'Person archivieren';
export const ARCHIVE_CONFIRM_LABEL = 'Archivieren';
export const ARCHIVE_EYEBROW = 'Person archivieren';
export const ARCHIVE_EXPLANATION =
  'Die Person verschwindet aus dem Register und aus jeder Auswahl.';

export const toArchiveQuestion = (person: PersonDetails): string =>
  `${toPersonName(person)} archivieren?`;

type ArchiveTieKind = RunningTie['kind'];

export interface ArchiveTie {
  kind: ArchiveTieKind;
  name: string | null;
  startsOn: string;
}

interface ArchivePause {
  firstSessionYear: number;
  lastSessionYear: number | null;
}

export interface ArchivePlan {
  ends: readonly ArchiveTie[];
  cutPauses: readonly ArchivePause[];
  deletes: readonly ArchiveTie[];
  deletedPauses: readonly ArchivePause[];
  earliestLastDay: string | null;
  limitingTie: ArchiveTie | null;
}

type ArchivedPerson = Pick<
  PersonDetails,
  | 'memberships'
  | 'groups'
  | 'roles'
  | 'unendedGroupAdminTenures'
  | 'unendedBoardSeats'
  | 'unendedKeyHoldings'
  | 'unendedTiesUnderArchivedParents'
>;

const ARCHIVE_TIE_ORDER: readonly ArchiveTieKind[] = [
  'membership',
  'group',
  'role',
  'groupAdmin',
  'boardSeat',
  'keyHolding',
];

const toTie = (kind: ArchiveTieKind, name: string | null, startsOn: string): ArchiveTie => ({
  kind,
  name,
  startsOn,
});

const toUnendedTies = (person: ArchivedPerson, todayIsoDay: string): ArchiveTie[] => [
  ...person.memberships
    .filter((membership) => isUnended(membership.endedOn, todayIsoDay))
    .map((membership) => toTie('membership', null, membership.startedOn)),
  ...person.groups
    .filter((group) => isUnended(group.leftOn, todayIsoDay))
    .map((group) => toTie('group', group.name, group.joinedOn)),
  ...person.roles
    .filter((role) => isUnended(role.untilOn, todayIsoDay))
    .map((role) => toTie('role', role.name, role.sinceOn)),
  ...person.unendedGroupAdminTenures.map((tenure) =>
    toTie('groupAdmin', tenure.name, tenure.sinceOn),
  ),
  ...person.unendedBoardSeats.map((seat) => toTie('boardSeat', seat.name, seat.sinceOn)),
  ...person.unendedKeyHoldings.map((holding) => toTie('keyHolding', holding.name, holding.sinceOn)),
  ...person.unendedTiesUnderArchivedParents.map((tie) => toTie(tie.kind, tie.name, tie.sinceOn)),
];

const byClubOrder = (left: ArchiveTie, right: ArchiveTie): number =>
  ARCHIVE_TIE_ORDER.indexOf(left.kind) - ARCHIVE_TIE_ORDER.indexOf(right.kind);

const hasBegun = (tie: ArchiveTie, todayIsoDay: string): boolean => tie.startsOn < todayIsoDay;

const sessionYearOf = (isoDay: string): number => sessionAt(fromIsoDay(isoDay)).startYear;

const reachesPast = (pause: PersonPause, sessionYear: number): boolean =>
  pause.firstSessionYear <= sessionYear &&
  (pause.lastSessionYear === null || pause.lastSessionYear > sessionYear);

const begunMembershipPauses = (
  memberships: readonly PersonMembership[],
  todayIsoDay: string,
): PersonPause[] =>
  memberships
    .filter(
      (membership) =>
        isUnended(membership.endedOn, todayIsoDay) && membership.startedOn < todayIsoDay,
    )
    .flatMap((membership) => membership.pauses);

const toLatestStarting = (ties: readonly ArchiveTie[]): ArchiveTie | null =>
  ties.reduce<ArchiveTie | null>(
    (latest, tie) => (latest === null || tie.startsOn > latest.startsOn ? tie : latest),
    null,
  );

export const toArchivePlan = (
  person: ArchivedPerson,
  todayIsoDay: string,
  lastDay: string | null,
): ArchivePlan => {
  const ties = toUnendedTies(person, todayIsoDay).sort(byClubOrder);
  const ends = ties.filter((tie) => hasBegun(tie, todayIsoDay));
  const deletes = ties.filter((tie) => !hasBegun(tie, todayIsoDay));
  const limitingTie = toLatestStarting(ends);
  const pauses = begunMembershipPauses(person.memberships, todayIsoDay);
  const lastSessionYear = lastDay === null || ends.length === 0 ? null : sessionYearOf(lastDay);

  return {
    ends,
    cutPauses:
      lastSessionYear === null
        ? []
        : pauses
            .filter((pause) => reachesPast(pause, lastSessionYear))
            .map((pause) => ({ firstSessionYear: pause.firstSessionYear, lastSessionYear })),
    deletes,
    deletedPauses:
      lastSessionYear === null
        ? []
        : pauses
            .filter((pause) => pause.firstSessionYear > lastSessionYear)
            .map((pause) => ({
              firstSessionYear: pause.firstSessionYear,
              lastSessionYear: pause.lastSessionYear,
            })),
    earliestLastDay: limitingTie === null ? null : limitingTie.startsOn,
    limitingTie,
  };
};

export const toDefaultLastDay = (todayIsoDay: string): string => shiftDay(todayIsoDay, -1);

export type LastDayVerdict = 'fine' | 'missing' | 'tooLate' | 'beforeStart';

export const toLastDayVerdict = (
  lastDay: string | null,
  plan: ArchivePlan,
  todayIsoDay: string,
): LastDayVerdict => {
  if (lastDay === null) {
    return 'missing';
  }
  if (lastDay >= todayIsoDay) {
    return 'tooLate';
  }

  return plan.earliestLastDay !== null && lastDay < plan.earliestLastDay ? 'beforeStart' : 'fine';
};

const PAUSE_LABEL = 'Ruhezeit';
const CUT_SUFFIX = ' (gekürzt)';

const toArchiveTieLabel = (tie: ArchiveTie): string =>
  tie.name === null ? TIE_LABELS[tie.kind] : `${TIE_LABELS[tie.kind]} ${tie.name}`;

const toPauseLabel = (pause: ArchivePause): string =>
  `${PAUSE_LABEL} ${formatSessionSpan(pause.firstSessionYear, pause.lastSessionYear)}`;

const isMembership = (tie: ArchiveTie): boolean => tie.kind === 'membership';

const toArchiveEndsLine = (plan: ArchivePlan): string =>
  [
    ...plan.ends.filter(isMembership).map(toArchiveTieLabel),
    ...plan.cutPauses.map((pause) => `${toPauseLabel(pause)}${CUT_SUFFIX}`),
    ...plan.ends.filter((tie) => !isMembership(tie)).map(toArchiveTieLabel),
  ].join(TIE_SEPARATOR);

const toArchiveDeletesLine = (plan: ArchivePlan): string =>
  [
    ...plan.deletes.map((tie) => `${toArchiveTieLabel(tie)} ab ${formatIsoDay(tie.startsOn)}`),
    ...plan.deletedPauses.map(toPauseLabel),
  ].join(TIE_SEPARATOR);

export type LastDayNote = 'missing' | 'tooLate' | 'earliest' | null;

export const toLastDayNote = (
  verdict: LastDayVerdict,
  plan: ArchivePlan,
  lastDay: string | null,
): LastDayNote => {
  switch (verdict) {
    case 'missing':
    case 'tooLate':
      return verdict;
    case 'beforeStart':
      return 'earliest';
    case 'fine':
      return lastDay === plan.earliestLastDay ? 'earliest' : null;
  }
};

const toEarliestLastDayHint = (plan: ArchivePlan): string | null =>
  plan.limitingTie === null
    ? null
    : `Frühestens ${formatIsoDay(plan.limitingTie.startsOn)} – ${toArchiveTieLabel(plan.limitingTie)} begann da.`;

export const toLastDayNoteText = (note: LastDayNote, plan: ArchivePlan): string | null => {
  switch (note) {
    case 'missing':
      return 'Der letzte Tag fehlt – es läuft noch etwas.';
    case 'tooLate':
      return 'Der letzte Tag ist spätestens gestern.';
    case 'earliest':
      return toEarliestLastDayHint(plan);
    case null:
      return null;
  }
};

export const LAST_DAY_LABEL = 'Letzter Tag';
const DELETES_FACT_LABEL = 'Wird gelöscht';
const NOTHING_REOPENS = 'Wiederherstellen öffnet nichts davon wieder.';

const toEndsFactLabel = (lastDay: string | null): string =>
  lastDay === null ? 'Endet' : `Endet am ${formatIsoDay(lastDay)}`;

const hasArchiveEffects = (plan: ArchivePlan): boolean =>
  plan.ends.length > 0 || plan.deletes.length > 0;

export const toArchiveConsequence = (
  person: PersonDetails,
  todayLabel: string,
  plan: ArchivePlan,
): string => {
  const archived = `Ab dem ${todayLabel} ist ${person.firstName} archiviert.`;

  return hasArchiveEffects(plan) ? `${archived} ${NOTHING_REOPENS}` : archived;
};

export const toArchiveFacts = (
  person: PersonDetails,
  plan: ArchivePlan,
  lastDay: string | null,
): KkConfirmFact[] => {
  const facts: KkConfirmFact[] = [
    { label: 'Person', value: toPersonName(person) },
    { label: 'Mitgliedschaft', value: toMembershipStateLabel(person.membershipState) },
  ];

  if (plan.ends.length > 0) {
    facts.push({ label: toEndsFactLabel(lastDay), value: toArchiveEndsLine(plan) });
  }
  if (plan.deletes.length > 0 || plan.deletedPauses.length > 0) {
    facts.push({ label: DELETES_FACT_LABEL, value: toArchiveDeletesLine(plan) });
  }

  return facts;
};

export const RESTORE_PERSON_LABEL = 'Wiederherstellen';
export const RESTORE_EYEBROW = 'Person wiederherstellen';
export const RESTORE_EXPLANATION = 'Die Person steht wieder im Register und in jeder Auswahl.';

export const toRestoreQuestion = (person: PersonDetails): string =>
  `${toPersonName(person)} wiederherstellen?`;

export const toRestoreConsequence = (person: PersonDetails, todayLabel: string): string =>
  `Ab dem ${todayLabel} steht ${person.firstName} wieder im Register.`;

export const toRestoreFacts = (archive: PersonArchive, person: PersonDetails): KkConfirmFact[] => {
  const facts: KkConfirmFact[] = [
    { label: 'Person', value: toPersonName(person) },
    { label: 'Archiviert am', value: formatIsoDay(archive.archivedOn) },
  ];

  if (archive.archivedBy !== null) {
    facts.push({ label: 'Archiviert von', value: toPersonName(archive.archivedBy) });
  }

  return facts;
};

export const toPersonArchivedMessage = (personName: string): string =>
  `${personName} ist archiviert.`;

export const toPersonRestoredMessage = (personName: string): string =>
  `${personName} ist wiederhergestellt.`;

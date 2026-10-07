import type { KkConfirmFact } from '@furria/ui';
import { toActLine } from '@/lib/act-line';
import { fromIsoDay } from '@/lib/day';
import { formatIsoDay, toMembershipStateLabel } from '@/lib/membership-labels';
import { toPersonName } from './manage-persons-labels';
import type { PersonArchive, PersonDetails } from './schemas';

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

export const toArchiveBlockedLine = (ties: readonly RunningTie[]): string =>
  `Archivieren geht erst, wenn nichts mehr läuft. Läuft noch: ${toRunningTiesList(ties)}.`;

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
  'Die Person verschwindet aus dem Register und aus jeder Auswahl. Alles, was über sie festgehalten ist, bleibt erhalten – auch ihr Account. Im Register findest du sie unter „archiviert“.';

export const toArchiveQuestion = (person: PersonDetails): string =>
  `${toPersonName(person)} archivieren?`;

export const toArchiveConsequence = (person: PersonDetails, todayLabel: string): string =>
  `Ab dem ${todayLabel} ist ${person.firstName} archiviert. Beginnt etwas Neues für ${person.firstName}, ist die Archivierung von selbst aufgehoben.`;

export const toArchiveFacts = (person: PersonDetails, todayLabel: string): KkConfirmFact[] => [
  { label: 'Person', value: toPersonName(person) },
  { label: 'Mitgliedschaft', value: toMembershipStateLabel(person.membershipState) },
  { label: 'Ab', value: todayLabel },
];

export const RESTORE_PERSON_LABEL = 'Wiederherstellen';
export const RESTORE_EYEBROW = 'Person wiederherstellen';
export const RESTORE_EXPLANATION =
  'Die Person steht wieder im Register und in jeder Auswahl. Was über sie festgehalten ist, bleibt unverändert.';

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

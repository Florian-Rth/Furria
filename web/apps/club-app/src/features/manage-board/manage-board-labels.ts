import type { KkConfirmFact, KkSelectOption } from '@furria/ui';
import { isFutureDay } from '@/lib/day';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import type { BoardOffice, BoardSeat, ImpliedRoleOption } from './schemas';

export const BOARD_TITLE = 'Vorstand';

export const OFFICE_EYEBROW = 'Vorstandsfunktion';

export const PAST_SEATS_LABEL = 'Frühere Sitze';

export const ARCHIVED_OFFICE_NOTE =
  'Diese Vorstandsfunktion gehört nicht mehr zum Vorstand. Ihre Sitze bleiben als Geschichte stehen. Zum Besetzen oder Bearbeiten musst du sie zuerst wieder aktivieren.';

export const toArchivedOfficeMeta = (archivedOn: string | null): string | undefined =>
  archivedOn === null ? undefined : `Archiviert am ${formatIsoDay(archivedOn)}`;

export const NO_IMPLIED_ROLE_VALUE = '';
export const NO_IMPLIED_ROLE_LABEL = 'keine Rolle';

export const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

const isSeatRunningOn = (seat: BoardSeat, todayIsoDay: string): boolean =>
  seat.sinceOn <= todayIsoDay && (seat.untilOn === null || seat.untilOn >= todayIsoDay);

export const isVacantOn = (seats: readonly BoardSeat[], todayIsoDay: string): boolean =>
  !seats.some((seat) => isSeatRunningOn(seat, todayIsoDay));

export interface BoardOfficeEntry {
  boardOfficeId: number;
  name: string;
  sortOrder: number;
  impliedRoleId: number | null;
  impliedRoleName: string | null;
  archivedOn: string | null;
  isArchived: boolean;
  isVacant: boolean;
  seats: readonly BoardSeat[];
  pastSeats: readonly BoardSeat[];
}

const toOfficeEntry = (office: BoardOffice, todayIsoDay: string): BoardOfficeEntry => ({
  boardOfficeId: office.boardOfficeId,
  name: office.name,
  sortOrder: office.sortOrder,
  impliedRoleId: office.impliedRoleId,
  impliedRoleName: office.impliedRoleName,
  archivedOn: office.archivedOn,
  isArchived: office.archivedOn !== null,
  isVacant: isVacantOn(office.seats, todayIsoDay),
  seats: office.seats,
  pastSeats: office.pastSeats,
});

const inBandOrder = (left: BoardOfficeEntry, right: BoardOfficeEntry): number => {
  if (left.isArchived !== right.isArchived) {
    return left.isArchived ? 1 : -1;
  }
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return left.name.localeCompare(right.name, 'de');
};

export const toBoardEntries = (
  offices: readonly BoardOffice[],
  todayIsoDay: string,
): BoardOfficeEntry[] =>
  offices.map((office) => toOfficeEntry(office, todayIsoDay)).sort(inBandOrder);

export const toSeatPeriodLabel = (seat: BoardSeat, todayIsoDay: string): string => {
  if (seat.untilOn !== null) {
    return formatPeriod(seat.sinceOn, seat.untilOn);
  }
  if (isFutureDay(seat.sinceOn, todayIsoDay)) {
    return `ab ${formatIsoDay(seat.sinceOn)}`;
  }

  return `seit ${formatIsoDay(seat.sinceOn)}`;
};

const toBandHead = (live: number): string =>
  live === 1
    ? 'Eine Vorstandsfunktion ist festgehalten.'
    : `${live} Vorstandsfunktionen sind festgehalten.`;

const toVacancyTail = (vacant: number): string => {
  if (vacant === 0) {
    return '';
  }
  if (vacant === 1) {
    return ' Eine ist unbesetzt.';
  }

  return ` ${vacant} sind unbesetzt.`;
};

const toArchiveTail = (archived: number): string => {
  if (archived === 0) {
    return '';
  }
  if (archived === 1) {
    return ' Eine weitere ist archiviert.';
  }

  return ` ${archived} weitere sind archiviert.`;
};

const IMPLIED_ROLE_RULE =
  'Wer in einer Funktion sitzt, hat die Rechte der Rolle, die sie nach sich zieht — solange der Sitz läuft.';

export const toBoardLead = (entries: readonly BoardOfficeEntry[]): string => {
  const live = entries.filter((entry) => !entry.isArchived);
  const vacant = live.filter((entry) => entry.isVacant).length;
  const band = `${toBandHead(live.length)}${toVacancyTail(vacant)}${toArchiveTail(entries.length - live.length)}`;

  return `${band} ${IMPLIED_ROLE_RULE}`;
};

export const toImpliedRoleChoices = (
  roles: readonly ImpliedRoleOption[],
  impliedRoleId: number | null,
  impliedRoleName: string | null,
): KkSelectOption[] => {
  const offered = roles
    .filter((role) => role.archivedOn === null || role.roleId === impliedRoleId)
    .map((role) => ({ value: String(role.roleId), label: role.name }));
  const carriesCurrent = roles.some((role) => role.roleId === impliedRoleId);
  const missing =
    impliedRoleId === null || carriesCurrent || impliedRoleName === null
      ? []
      : [{ value: String(impliedRoleId), label: impliedRoleName }];

  return [{ value: NO_IMPLIED_ROLE_VALUE, label: NO_IMPLIED_ROLE_LABEL }, ...missing, ...offered];
};

export const toImpliedRoleId = (value: string): number | null =>
  value === NO_IMPLIED_ROLE_VALUE ? null : Number(value);

export const toImpliedRoleValue = (impliedRoleId: number | null): string =>
  impliedRoleId === null ? NO_IMPLIED_ROLE_VALUE : String(impliedRoleId);

export const IMPLIED_ROLE_LABEL = 'Diese Funktion zieht nach sich';
export const IMPLIED_ROLE_READ_ONLY_HINT =
  'Nur wer Rollen & Rechte verwalten darf, kann das ändern.';
export const NO_IMPLIED_ROLE_VALUE_LABEL = 'keine';

export const toImpliedRoleStatement = (impliedRoleName: string | null): string =>
  impliedRoleName === null ? NO_IMPLIED_ROLE_VALUE_LABEL : impliedRoleName;

export const SEAT_PERIOD_LABEL = 'Sitz';

export const VACANT_TITLE = 'UNBESETZT';

export const toVacantDescription = (name: string): string =>
  `Für ${name} ist gerade niemand eingetragen. Trag ein, wer gewählt wurde — erst dann greift, was die Funktion nach sich zieht.`;

export const toEndSeatLabel = (personName: string): string =>
  `Vorstandssitz von ${personName} beenden`;

export const toOfficeCreatedMessage = (name: string): string =>
  `Die Vorstandsfunktion ${name} ist angelegt.`;

export const toOfficeSavedMessage = (name: string): string =>
  `Die Angaben zu ${name} sind gespeichert.`;

export const toOfficeArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toOfficeRestoredMessage = (name: string): string =>
  `${name} gehört wieder zum Vorstand.`;

export const toImpliedRoleSavedMessage = (name: string, roleName: string | null): string =>
  roleName === null
    ? `${name} zieht keine Rolle mehr nach sich.`
    : `${name} zieht jetzt ${roleName} nach sich.`;

export const toSeatOpenedMessage = (
  personName: string,
  officeName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `${personName} sitzt ab dem ${formatIsoDay(sinceOn)} als ${officeName} im Vorstand.`
    : `${personName} sitzt als ${officeName} im Vorstand.`;

export const toSeatEndedMessage = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Der Vorstandssitz von ${personName} endet am ${formatIsoDay(endedOn)}.`
    : `Der Vorstandssitz von ${personName} ist beendet.`;

export const toSeatConsequence = (
  personName: string,
  officeName: string,
  impliedRoleName: string | null,
  sinceOn: string,
  todayIsoDay: string,
): string => {
  const day = formatIsoDay(sinceOn);
  const opening = isFutureDay(sinceOn, todayIsoDay)
    ? `Ab dem ${day} sitzt ${personName} als ${officeName} im Vorstand — vorher nicht.`
    : `${personName} sitzt ab dem ${day} als ${officeName} im Vorstand.`;

  if (impliedRoleName === null) {
    return `${opening} Rechte kommen dadurch keine dazu.`;
  }

  return `${opening} Damit greifen für ${personName} die Rechte von ${impliedRoleName}.`;
};

export const toEndSeatQuestion = (firstName: string, officeName: string): string =>
  `${firstName} als ${officeName} beenden?`;

export const toEndSeatExplanation = (firstName: string): string =>
  `Der Vorstandssitz endet am gewählten Tag und wandert in die Geschichte der Funktion. Gelöscht wird nichts: ${firstName} kann jederzeit wieder eingetragen werden.`;

export const toEndSeatConsequence = (
  firstName: string,
  officeName: string,
  impliedRoleName: string | null,
  endedOn: string,
  todayIsoDay: string,
): string => {
  const day = formatIsoDay(endedOn);
  const opening = isFutureDay(endedOn, todayIsoDay)
    ? `Der ${day} wird der letzte Tag, an dem ${firstName} als ${officeName} im Vorstand sitzt.`
    : `Der ${day} ist der letzte Tag, an dem ${firstName} als ${officeName} im Vorstand sitzt.`;

  if (impliedRoleName === null) {
    return opening;
  }

  return `${opening} Danach greifen die Rechte von ${impliedRoleName} für ${firstName} nicht mehr.`;
};

export const toEndSeatFacts = (
  seat: BoardSeat,
  officeName: string,
  endedOn: string | null,
): KkConfirmFact[] => [
  { label: 'Person', value: toPersonName(seat) },
  { label: 'Vorstandsfunktion', value: officeName },
  { label: 'Im Vorstand seit', value: formatIsoDay(seat.sinceOn) },
  { label: 'Letzter Tag', value: endedOn === null ? 'noch offen' : formatIsoDay(endedOn) },
];

export const ARCHIVE_OFFICE_BLOCKED_HINT = 'Erst den Sitz beenden';

export const isOfficeArchivable = (entry: BoardOfficeEntry): boolean =>
  !entry.isArchived && entry.seats.length === 0;

export const ARCHIVE_OFFICE_EYEBROW = 'Vorstandsfunktion archivieren';

export const toArchiveOfficeQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_OFFICE_EXPLANATION =
  'Archivieren löscht nichts: Die Vorstandsfunktion verlässt den Vorstand und nimmt die Rechte mit, die sie nach sich zieht — sie lässt sich nicht mehr besetzen, ihre früheren Sitze bleiben als Geschichte stehen. Zurückholen kannst du sie jederzeit.';

export const toArchiveOfficeConsequence = (name: string, todayIsoDay: string): string =>
  `Ab heute, dem ${formatIsoDay(todayIsoDay)}, gehört ${name} nicht mehr zum Vorstand und lässt sich nicht mehr besetzen. Die früheren Sitze bleiben stehen.`;

export const RESTORE_OFFICE_EYEBROW = 'Vorstandsfunktion aktivieren';

export const toRestoreOfficeQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_OFFICE_EXPLANATION =
  'Die Vorstandsfunktion steht wieder im Vorstand und lässt sich wieder besetzen. Zieht sie eine Rolle nach sich, greifen deren Rechte wieder für jeden, der in ihr sitzt. An ihrer Geschichte ändert sich nichts — sie war nie weg.';

export const toRestoreOfficeConsequence = (name: string, todayIsoDay: string): string =>
  `Ab heute, dem ${formatIsoDay(todayIsoDay)}, gehört ${name} wieder zum Vorstand. An den früheren Sitzen ändert sich nichts.`;

export const toBoardOfficeFacts = (
  entry: BoardOfficeEntry,
  todayIsoDay: string,
): KkConfirmFact[] => [
  { label: 'Vorstandsfunktion', value: entry.name },
  { label: 'Zieht nach sich', value: toImpliedRoleStatement(entry.impliedRoleName) },
  { label: 'Laufende Sitze', value: String(entry.seats.length) },
  { label: 'Ab', value: formatIsoDay(todayIsoDay) },
];

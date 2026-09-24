import type { KkConfirmFact, KkScreenOrigin, KkSelectOption } from '@furria/ui';
import { isFutureDay } from '@/lib/day';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import type { BoardOffice, BoardSeat, ImpliedRoleOption } from './schemas';

export const BOARD_TITLE = 'Vorstand';

export const BOARD_ORIGIN: KkScreenOrigin = { label: BOARD_TITLE, to: '/manage/board' };

const ID_PATTERN = /^[1-9]\d*$/;

export const toBoardOfficeId = (raw: string): number | null =>
  ID_PATTERN.test(raw) ? Number(raw) : null;

export const toBoardSeatId = (raw: string): number | null =>
  ID_PATTERN.test(raw) ? Number(raw) : null;

export const OFFICE_EYEBROW = 'Vorstandsfunktion';

export const PAST_SEATS_LABEL = 'Frühere Sitze';

export const ARCHIVED_OFFICE_NOTE =
  'Diese Vorstandsfunktion ist archiviert. Aktiviere sie, um sie zu bearbeiten oder zu besetzen.';

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

export const toOfficeOrigin = (entry: { boardOfficeId: number; name: string }): KkScreenOrigin => ({
  label: entry.name,
  to: '/manage/board',
});

export interface SeatChainRow {
  key: string;
  span: string;
  isEdited: boolean;
}

export const toSeatChainRows = (
  entry: BoardOfficeEntry,
  editedSeatId: number | null,
): SeatChainRow[] => {
  const toRow = (seat: BoardSeat): SeatChainRow => ({
    key: String(seat.boardSeatId),
    span: formatPeriod(seat.sinceOn, seat.untilOn),
    isEdited: seat.boardSeatId === editedSeatId,
  });

  return [...entry.seats.map(toRow), ...entry.pastSeats.map(toRow)];
};

export const toSeatPeriodLabel = (seat: BoardSeat, todayIsoDay: string): string => {
  if (seat.untilOn !== null) {
    return formatPeriod(seat.sinceOn, seat.untilOn);
  }
  if (isFutureDay(seat.sinceOn, todayIsoDay)) {
    return `ab ${formatIsoDay(seat.sinceOn)}`;
  }

  return `seit ${formatIsoDay(seat.sinceOn)}`;
};

export const BOARD_LEAD = 'Vorstandsfunktionen und ihre Besetzung.';
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

export const IMPLIED_ROLE_LABEL = 'Verknüpfte Rolle';
export const IMPLIED_ROLE_READ_ONLY_HINT = 'Nur mit der Berechtigung für Rollen & Rechte änderbar.';
export const NO_IMPLIED_ROLE_VALUE_LABEL = 'keine';

export const toImpliedRoleStatement = (impliedRoleName: string | null): string =>
  impliedRoleName === null ? NO_IMPLIED_ROLE_VALUE_LABEL : impliedRoleName;

export const SEAT_PERIOD_LABEL = 'Sitz';

export const VACANT_TITLE = 'UNBESETZT';

export const toVacantDescription = (name: string): string => `${name} ist derzeit nicht besetzt.`;

export const toOfficeCreatedMessage = (name: string): string =>
  `Die Vorstandsfunktion ${name} ist angelegt.`;

export const toOfficeSavedMessage = (name: string): string =>
  `Die Angaben zu ${name} sind gespeichert.`;

export const toOfficeArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toOfficeRestoredMessage = (name: string): string =>
  `${name} gehört wieder zum Vorstand.`;

export const toImpliedRoleSavedMessage = (name: string, roleName: string | null): string =>
  roleName === null
    ? `${name} ist mit keiner Rolle mehr verknüpft.`
    : `${name} ist jetzt mit ${roleName} verknüpft.`;

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
    ? `${personName} sitzt ab dem ${day} als ${officeName} im Vorstand.`
    : `${personName} sitzt seit dem ${day} als ${officeName} im Vorstand.`;

  if (impliedRoleName === null) {
    return `${opening} Damit sind keine zusätzlichen Rechte verbunden.`;
  }

  return `${opening} ${personName} erhält damit die Rechte von ${impliedRoleName}.`;
};

export const toEndSeatConsequence = (
  firstName: string,
  officeName: string,
  impliedRoleName: string | null,
  endedOn: string,
  todayIsoDay: string,
): string => {
  const day = formatIsoDay(endedOn);
  const opening = isFutureDay(endedOn, todayIsoDay)
    ? `${firstName} sitzt bis einschließlich ${day} als ${officeName} im Vorstand.`
    : `Der Sitz von ${firstName} als ${officeName} ist zum ${day} beendet.`;

  if (impliedRoleName === null) {
    return opening;
  }

  return `${opening} Danach entfallen die Rechte von ${impliedRoleName}.`;
};

export const ARCHIVE_OFFICE_BLOCKED_NOTE =
  'Eine besetzte Vorstandsfunktion lässt sich nicht archivieren.';

export const isOfficeArchivable = (entry: BoardOfficeEntry): boolean =>
  !entry.isArchived && entry.seats.length === 0;

export const ARCHIVE_OFFICE_EYEBROW = 'Vorstandsfunktion archivieren';

export const toArchiveOfficeQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_OFFICE_EXPLANATION =
  'Die Vorstandsfunktion lässt sich danach nicht mehr besetzen. Frühere Sitze bleiben erhalten.';

export const toArchiveOfficeConsequence = (name: string, todayIsoDay: string): string =>
  `${name} ist ab heute, dem ${formatIsoDay(todayIsoDay)}, archiviert.`;

export const RESTORE_OFFICE_EYEBROW = 'Vorstandsfunktion aktivieren';

export const toRestoreOfficeQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_OFFICE_EXPLANATION =
  'Die Vorstandsfunktion lässt sich wieder besetzen. Ihr Verlauf bleibt unverändert.';

export const toRestoreOfficeConsequence = (name: string, todayIsoDay: string): string =>
  `${name} ist ab heute, dem ${formatIsoDay(todayIsoDay)}, wieder aktiv.`;

export const toBoardOfficeFacts = (
  entry: BoardOfficeEntry,
  todayIsoDay: string,
): KkConfirmFact[] => [
  { label: 'Vorstandsfunktion', value: entry.name },
  { label: 'Verknüpfte Rolle', value: toImpliedRoleStatement(entry.impliedRoleName) },
  { label: 'Laufende Sitze', value: String(entry.seats.length) },
  { label: 'Ab', value: formatIsoDay(todayIsoDay) },
];

import type { KkConfirmFact, KkScreenOrigin, KkSelectOption } from '@furria/ui';
import type { ClubIcon } from '@/lib/club-icon';
import { isFutureDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import type { BoardOffice, BoardSeat, ImpliedRoleOption } from './schemas';

export const BOARD_TITLE = 'Vorstand';

export const BOARD_ORIGIN: KkScreenOrigin = { label: BOARD_TITLE, to: '/manage/board' };

export const NO_IMPLIED_ROLE_VALUE = '';
const NO_IMPLIED_ROLE_LABEL = 'keine Rolle';

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
  isPublic: boolean;
  icon: ClubIcon | null;
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
  isPublic: office.isPublic,
  icon: office.icon,
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

export const toOfficeOrigin = (
  entry: { boardOfficeId: number; name: string },
  returnTo: 'new' | 'hub' | 'office',
): KkScreenOrigin =>
  returnTo === 'office'
    ? {
        label: entry.name,
        to: '/manage/board/$boardOfficeId',
        params: { boardOfficeId: String(entry.boardOfficeId) },
      }
    : { label: BOARD_TITLE, to: '/manage/board' };

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
const NO_IMPLIED_ROLE_VALUE_LABEL = 'keine';

export const toImpliedRoleStatement = (impliedRoleName: string | null): string =>
  impliedRoleName === null ? NO_IMPLIED_ROLE_VALUE_LABEL : impliedRoleName;

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

export const toPublicationSavedMessage = (name: string, isPublic: boolean): string =>
  isPublic ? `${name} steht jetzt auf der Website.` : `${name} steht nicht mehr auf der Website.`;

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

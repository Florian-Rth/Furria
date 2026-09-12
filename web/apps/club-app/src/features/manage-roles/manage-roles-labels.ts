import type { KkConfirmFact, KkDateQuickChoice, KkFilterOption } from '@furria/ui';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { formatIsoDay, formatSinceSession } from '@/lib/membership-labels';
import { UNARCHIVED_LABEL, UNHELD_CHIP } from '@/lib/state-chips';
import { normalizeForSearch } from '@/lib/text';
import { isPermissionKey, toPermissionCopy } from './role-permission-copy';
import type { RoleDetails, RoleHolder, RoleSummary, RolesResponse } from './schemas';

export const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

export const toEndHolderLabel = (personName: string): string =>
  `Inhaberschaft von ${personName} beenden`;

export const toHoldersMeta = (
  holders: readonly { firstName: string; lastName: string }[],
): string | null => {
  const [first] = holders;

  if (first === undefined) {
    return null;
  }
  if (holders.length === 1) {
    return toPersonName(first);
  }

  const further = holders.length - 1;

  if (further === 1) {
    return `${toPersonName(first)} und 1 weitere Person`;
  }

  return `${toPersonName(first)} und ${further} weitere Personen`;
};

export const MANAGE_ROLES_SECTION_TITLE = 'Alle Rollen';

export const ROLE_SECTION_TITLES = {
  holders: 'Inhaber',
  permissions: 'Rechte',
  history: 'Geschichte',
} as const;

export const toRolesLead = (roles: readonly RoleSummary[]): string => {
  const archived = roles.filter((role) => role.archivedOn !== null).length;
  const active = roles.length - archived;
  const head =
    active === 1
      ? 'Eine Rolle sagt, wer im Verein was darf.'
      : `${active} Rollen sagen, wer im Verein was darf.`;

  if (archived === 0) {
    return head;
  }

  const tail =
    archived === 1 ? 'Eine weitere ist archiviert.' : `${archived} weitere sind archiviert.`;

  return `${head} ${tail}`;
};

export const toRoleSearchTerm = (raw: string): string | null => {
  const trimmed = raw.trim();

  return trimmed === '' ? null : trimmed;
};

const matchesRole = (role: RoleSummary, term: string): boolean => {
  const haystack = normalizeForSearch(`${role.name} ${role.description}`);

  return normalizeForSearch(term)
    .split(/\s+/)
    .every((part) => haystack.includes(part));
};

export interface RoleMasterEntry {
  roleId: number;
  name: string;
  description: string;
  meta: string | null;
  holderCount: number;
  isArchived: boolean;
  isUnheld: boolean;
}

const toMasterEntry = (role: RoleSummary): RoleMasterEntry => ({
  roleId: role.roleId,
  name: role.name,
  description: role.description,
  meta: toHoldersMeta(role.holders),
  holderCount: role.holders.length,
  isArchived: role.archivedOn !== null,
  isUnheld: role.holders.length === 0,
});

const archivedLast = (left: RoleMasterEntry, right: RoleMasterEntry): number => {
  if (left.isArchived === right.isArchived) {
    return 0;
  }

  return left.isArchived ? 1 : -1;
};

export const ALL_ROLES_FILTER_ID = 'all';
export const ACTIVE_ROLES_FILTER_ID = 'active';
export const ARCHIVED_ROLES_FILTER_ID = 'archived';

const ALL_ROLES_LABEL = 'Alle';
const ACTIVE_ROLES_LABEL = UNARCHIVED_LABEL;
const ARCHIVED_ROLES_LABEL = 'archiviert';
const ALL_ROLES_SUGGESTION = 'Wähle „Alle“, um wieder alle zu sehen.';

const isArchivedRole = (role: RoleSummary): boolean => role.archivedOn !== null;

export const toRoleStatusFilterOptions = (roles: readonly RoleSummary[]): KkFilterOption[] => {
  const archived = roles.filter(isArchivedRole).length;

  return [
    { id: ALL_ROLES_FILTER_ID, label: ALL_ROLES_LABEL, count: roles.length },
    { id: ACTIVE_ROLES_FILTER_ID, label: ACTIVE_ROLES_LABEL, count: roles.length - archived },
    { id: ARCHIVED_ROLES_FILTER_ID, label: ARCHIVED_ROLES_LABEL, count: archived },
  ];
};

const matchesRoleStatus = (role: RoleSummary, status: string): boolean => {
  if (status === ACTIVE_ROLES_FILTER_ID) {
    return !isArchivedRole(role);
  }
  if (status === ARCHIVED_ROLES_FILTER_ID) {
    return isArchivedRole(role);
  }

  return true;
};

export const toMasterEntries = (
  roles: readonly RoleSummary[],
  query: string,
  status: string,
): RoleMasterEntry[] => {
  const term = toRoleSearchTerm(query);
  const matching = roles.filter(
    (role) => matchesRoleStatus(role, status) && (term === null || matchesRole(role, term)),
  );

  return matching.map(toMasterEntry).sort(archivedLast);
};

export interface RolePermissionEntry {
  key: PermissionKey;
  title: string;
  line: string;
  enabled: boolean;
}

export const toPermissionEntries = (
  catalogue: readonly string[],
  granted: readonly string[],
): RolePermissionEntry[] =>
  catalogue.filter(isPermissionKey).map((key) => ({
    key,
    ...toPermissionCopy(key),
    enabled: granted.includes(key),
  }));

export const toNextPermissionKeys = (
  current: readonly string[],
  key: PermissionKey,
  enabled: boolean,
): string[] => {
  const without = [...new Set(current)].filter((entry) => entry !== key);

  return enabled ? [...without, key] : without;
};

export const toRoleSeed = (
  roles: RolesResponse | undefined,
  roleId: number | null,
): RoleDetails | undefined => {
  if (roles === undefined || roleId === null) {
    return undefined;
  }

  const match = roles.roles.find((role) => role.roleId === roleId);

  if (match === undefined) {
    return undefined;
  }

  return {
    roleId: match.roleId,
    name: match.name,
    description: match.description,
    archivedOn: match.archivedOn,
    permissionKeys: match.permissionKeys,
    holders: [],
    pastHolders: [],
  };
};

export const toArchivedMeta = (archivedOn: string | null): string | undefined =>
  archivedOn === null ? undefined : `Archiviert am ${formatIsoDay(archivedOn)}`;

export const toHolderCountLabel = (count: number): string => {
  if (count === 0) {
    return UNHELD_CHIP.label;
  }
  if (count === 1) {
    return '1 Inhaberschaft';
  }

  return `${count} Inhaberschaften`;
};

export const toHolderSinceValue = (holder: RoleHolder): string => formatSinceSession(holder.since);

export const toHolderUnitLabel = (count: number): string =>
  count === 1 ? 'Inhaberschaft' : 'Inhaberschaften';

export const NO_ROLE_SEARCH_RESULT_TITLE = 'KEINE ROLLE GEFUNDEN';

const NO_ROLE_MATCH_LINES: Record<string, string> = {
  [ACTIVE_ROLES_FILTER_ID]: `Gerade steht keine Rolle ${UNARCHIVED_LABEL}.`,
  [ARCHIVED_ROLES_FILTER_ID]: 'Gerade ist keine Rolle archiviert.',
};

export const toNoRoleMatchLine = (query: string, status: string): string => {
  const term = toRoleSearchTerm(query);

  if (term !== null) {
    return `Zu „${term}“ gibt es keine Rolle. Vielleicht anders geschrieben?`;
  }

  const statusLine = NO_ROLE_MATCH_LINES[status];

  if (statusLine === undefined) {
    return 'Es gibt noch keine Rolle.';
  }

  return `${statusLine} ${ALL_ROLES_SUGGESTION}`;
};

export const toNoDescriptionLine = (name: string): string =>
  `Zu ${name} steht noch nichts geschrieben.`;

export const toRoleCreatedMessage = (name: string): string => `Die Rolle ${name} ist angelegt.`;

export const toRoleSavedMessage = (name: string): string =>
  `Die Angaben zu ${name} sind gespeichert.`;

export const toRoleArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toRoleRestoredMessage = (name: string): string => `${name} ist wieder aktiv.`;

export const toPermissionSavedMessage = (title: string, enabled: boolean): string =>
  enabled ? `„${title}“ ist eingeschaltet.` : `„${title}“ ist ausgeschaltet.`;

export const toHolderAddedMessage = (
  personName: string,
  roleName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `${personName} hat ${roleName} ab dem ${formatIsoDay(sinceOn)} inne.`
    : `${personName} hat ${roleName} inne.`;

export const toHoldingEndedMessage = (
  personName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Die Inhaberschaft von ${personName} endet am ${formatIsoDay(endedOn)}.`
    : `Die Inhaberschaft von ${personName} ist beendet.`;

export const toHoldingConsequence = (
  personName: string,
  roleName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `Ab dem ${formatIsoDay(sinceOn)} hat ${personName} die Rechte von ${roleName} — vorher nicht.`
    : `${personName} hat die Rechte von ${roleName} ab dem ${formatIsoDay(sinceOn)}.`;

export const toEndHoldingQuestion = (firstName: string, roleName: string): string =>
  `${firstName} als ${roleName} beenden?`;

export const toEndHoldingExplanation = (firstName: string): string =>
  `Die Inhaberschaft endet am gewählten Tag und wandert in die Geschichte der Rolle. Gelöscht wird nichts: ${firstName} kann jederzeit wieder eingetragen werden.`;

export const toEndHoldingConsequence = (
  firstName: string,
  roleName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Der ${formatIsoDay(endedOn)} wird der letzte Tag, an dem ${firstName} ${roleName} innehat. Danach greifen die Rechte der Rolle für ${firstName} nicht mehr.`
    : `Der ${formatIsoDay(endedOn)} ist der letzte Tag, an dem ${firstName} ${roleName} innehat. Danach greifen die Rechte der Rolle für ${firstName} nicht mehr.`;

export const toEndHoldingFacts = (
  holder: RoleHolder,
  roleName: string,
  endedOn: string | null,
): KkConfirmFact[] => [
  { label: 'Person', value: toPersonName(holder) },
  { label: 'Rolle', value: roleName },
  { label: 'Inhaberin seit', value: formatIsoDay(holder.sinceOn) },
  { label: 'Letzter Tag', value: endedOn === null ? 'noch offen' : formatIsoDay(endedOn) },
];

export interface SelfLockoutInput {
  key: PermissionKey;
  enabled: boolean;
  roleId: number;
  viewerPersonId: number | undefined;
  roles: readonly RoleSummary[];
}

const grantsKeyToViewer = (
  role: RoleSummary,
  key: PermissionKey,
  viewerPersonId: number,
): boolean =>
  role.archivedOn === null &&
  role.permissionKeys.includes(key) &&
  role.holders.some((holder) => holder.personId === viewerPersonId);

export const isSelfLockout = ({
  key,
  enabled,
  roleId,
  viewerPersonId,
  roles,
}: SelfLockoutInput): boolean => {
  if (enabled || viewerPersonId === undefined) {
    return false;
  }

  const edited = roles.find((role) => role.roleId === roleId);

  if (edited === undefined || !grantsKeyToViewer(edited, key, viewerPersonId)) {
    return false;
  }

  return !roles.some(
    (role) => role.roleId !== roleId && grantsKeyToViewer(role, key, viewerPersonId),
  );
};

export interface KeyHandoverInput {
  key: PermissionKey;
  enabled: boolean;
}

export const isKeyHandover = ({ key, enabled }: KeyHandoverInput): boolean =>
  enabled && key === PERMISSION_KEYS.rolesManage;

export const KEY_HANDOVER_EYEBROW = 'Recht vergeben';
export const KEY_HANDOVER_CONFIRM_LABEL = 'Recht vergeben';

export const toKeyHandoverQuestion = (roleName: string): string =>
  `Rollen und Rechte an ${roleName} vergeben?`;

export const toKeyHandoverFacts = (
  roleName: string,
  holders: readonly { firstName: string; lastName: string }[],
): KkConfirmFact[] => [
  { label: 'Rolle', value: roleName },
  {
    label: 'Wer sie innehat',
    value: holders.length === 0 ? 'noch niemand' : holders.map(toPersonName).join(', '),
  },
];

export const SELF_LOCKOUT_EYEBROW = 'Recht abgeben';
export const SELF_LOCKOUT_EXPLANATION =
  'Du nimmst dir dieses Recht selbst weg. Danach kommst du hier nicht mehr rein.';
export const SELF_LOCKOUT_CONFIRM_LABEL = 'Recht abgeben';

export const toSelfLockoutQuestion = (permissionTitle: string): string =>
  `Dir selbst „${permissionTitle}“ wegnehmen?`;

export const toSelfLockoutFacts = (roleName: string, permissionTitle: string): KkConfirmFact[] => [
  { label: 'Rolle', value: roleName },
  { label: 'Recht', value: permissionTitle },
];

export const toArchiveRoleQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_ROLE_EXPLANATION =
  'Archivieren löscht nichts: Die Rolle verschwindet aus der Auswahl, ihre Inhaberschaften bleiben in den Profilen stehen.';

export const toArchiveRoleConsequence = (
  name: string,
  holderCount: number,
  todayIsoDay: string,
): string =>
  `Ab heute, dem ${formatIsoDay(todayIsoDay)}, greifen die Rechte von ${name} nicht mehr. Die ${toHolderCountLabel(holderCount)} bleiben bestehen.`;

export const toArchiveRoleFacts = (role: RoleDetails, todayIsoDay: string): KkConfirmFact[] => [
  { label: 'Rolle', value: role.name },
  { label: 'Archiviert am', value: formatIsoDay(todayIsoDay) },
  { label: 'Inhaberschaften', value: toHolderCountLabel(role.holders.length) },
];

const TODAY_LABEL = 'Heute';
const SESSION_START_LABEL = 'Sessionbeginn';
const SESSION_END_LABEL = 'Sessionende';

export const toStartQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const openingValue = toIsoDay(
    new Date(session.startYear, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY),
  );

  const choices: KkDateQuickChoice[] = [{ label: TODAY_LABEL, value: todayValue }];

  if (openingValue !== todayValue) {
    choices.push({ label: SESSION_START_LABEL, value: openingValue });
  }

  return choices;
};

export const toEndQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const closingValue = toIsoDay(
    new Date(session.startYear + 1, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY - 1),
  );

  const choices: KkDateQuickChoice[] = [{ label: TODAY_LABEL, value: todayValue }];

  if (closingValue !== todayValue) {
    choices.push({ label: SESSION_END_LABEL, value: closingValue });
  }

  return choices;
};

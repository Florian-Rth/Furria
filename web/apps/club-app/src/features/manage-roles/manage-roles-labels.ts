import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import type { KkDateQuickChoice } from '@furria/ui/KkDateField';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { UNHELD_CHIP } from '@/lib/state-chips';
import { isPermissionKey, toPermissionCopy } from './role-permission-copy';
import type { EditorReturn } from './roles-hub';
import type { RoleDetails, RoleSummary, RolesResponse } from './schemas';

export const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

export const ROLES_ORIGIN: KkScreenOrigin = { label: 'Rollen & Rechte', to: '/manage/roles' };

export const toRoleOrigin = (
  role: { roleId: number; name: string },
  returnTo: EditorReturn,
): KkScreenOrigin =>
  returnTo === 'role'
    ? { label: role.name, to: '/manage/roles/$roleId', params: { roleId: String(role.roleId) } }
    : ROLES_ORIGIN;

export const ROLES_LEAD = 'Rollen, ihre Rechte und Inhaber.';

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

export const toRoleDetailsSeed = (role: RoleSummary): RoleDetails => ({
  roleId: role.roleId,
  name: role.name,
  description: role.description,
  coin: role.coin,
  archivedOn: role.archivedOn,
  permissionKeys: role.permissionKeys,
  holders: [],
  pastHolders: [],
  impliedBy: role.impliedBy,
});

export const toRoleSeed = (
  roles: RolesResponse | undefined,
  roleId: number | null,
): RoleDetails | undefined => {
  if (roles === undefined || roleId === null) {
    return undefined;
  }

  const match = roles.roles.find((role) => role.roleId === roleId);

  return match === undefined ? undefined : toRoleDetailsSeed(match);
};

export const toHolderCountLabel = (count: number): string => {
  if (count === 0) {
    return UNHELD_CHIP.label;
  }
  if (count === 1) {
    return '1 Inhaberschaft';
  }

  return `${count} Inhaberschaften`;
};

export const toNoDescriptionLine = (name: string): string =>
  `Für ${name} gibt es noch keine Beschreibung.`;

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

export const toHoldingCorrectedMessage = (personName: string): string =>
  `Die Inhaberschaft von ${personName} ist geändert.`;

export const toHoldingConsequence = (
  personName: string,
  roleName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `${personName} erhält ab dem ${formatIsoDay(sinceOn)} die Rechte von ${roleName}.`
    : `${personName} hat seit dem ${formatIsoDay(sinceOn)} die Rechte von ${roleName}.`;

export const toEndHoldingConsequence = (
  firstName: string,
  roleName: string,
  endedOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `${firstName} hat ${roleName} bis einschließlich ${formatIsoDay(endedOn)} inne. Danach entfallen die Rechte der Rolle.`
    : `Die Inhaberschaft von ${firstName} für ${roleName} ist zum ${formatIsoDay(endedOn)} beendet. Die Rechte der Rolle entfallen.`;

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

export interface PermissionHandoverInput {
  key: PermissionKey;
  enabled: boolean;
}

export const isPermissionHandover = ({ key, enabled }: PermissionHandoverInput): boolean =>
  enabled && key === PERMISSION_KEYS.rolesManage;

export const PERMISSION_HANDOVER_EYEBROW = 'Recht vergeben';
export const PERMISSION_HANDOVER_CONFIRM_LABEL = 'Recht vergeben';

export const toPermissionHandoverQuestion = (roleName: string): string =>
  `Rollen und Rechte an ${roleName} vergeben?`;

export const toPermissionHandoverFacts = (
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
  'Du entziehst dir dieses Recht selbst und verlierst den Zugriff auf diese Seite.';
export const SELF_LOCKOUT_CONFIRM_LABEL = 'Recht abgeben';

export const toSelfLockoutQuestion = (permissionTitle: string): string =>
  `Dir selbst „${permissionTitle}“ wegnehmen?`;

export const toSelfLockoutFacts = (roleName: string, permissionTitle: string): KkConfirmFact[] => [
  { label: 'Rolle', value: roleName },
  { label: 'Recht', value: permissionTitle },
];

export type ArchivableRole = Pick<RoleSummary, 'name' | 'holders'>;

export const toArchiveRoleQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_ROLE_EXPLANATION =
  'Die Rolle verschwindet aus der Auswahl, ihre Rechte entfallen. Inhaberschaften bleiben erhalten.';

export const toArchiveRoleConsequence = (
  name: string,
  holderCount: number,
  todayIsoDay: string,
): string =>
  `Ab heute, dem ${formatIsoDay(todayIsoDay)}, entfallen die Rechte von ${name}. Die ${toHolderCountLabel(holderCount)} bleiben bestehen.`;

export const toArchiveRoleFacts = (role: ArchivableRole, todayIsoDay: string): KkConfirmFact[] => [
  { label: 'Rolle', value: role.name },
  { label: 'Archiviert am', value: formatIsoDay(todayIsoDay) },
  { label: 'Inhaberschaften', value: toHolderCountLabel(role.holders.length) },
];

export const RESTORE_ROLE_EYEBROW = 'Rolle aktivieren';

export const toRestoreRoleQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_ROLE_EXPLANATION =
  'Die Rolle steht wieder zur Auswahl, ihre Rechte gelten wieder für alle Inhaber.';

export const toRestoreRoleConsequence = (name: string, todayIsoDay: string): string =>
  `Ab heute, dem ${formatIsoDay(todayIsoDay)}, gelten die Rechte von ${name} wieder.`;

export const toRestoreRoleFacts = (role: ArchivableRole, todayIsoDay: string): KkConfirmFact[] => [
  { label: 'Rolle', value: role.name },
  { label: 'Aktiviert am', value: formatIsoDay(todayIsoDay) },
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

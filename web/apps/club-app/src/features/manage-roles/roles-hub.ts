import type { KkRoleMarkState } from '@furria/ui/KkRoleMark';
import type { KkStepState } from '@furria/ui/step-state';
import type { WriteLanding } from '@/features/write/landing-target';
import type { PermissionKey } from '@/lib/api/schemas';
import { isPermissionKey } from './role-permission-copy';
import type { ImpliedByOffice, RoleHolder, RolePaneTab, RoleSummary } from './schemas';

export type RoleFacts = Pick<
  RoleSummary,
  'archivedOn' | 'permissionKeys' | 'holders' | 'impliedBy'
>;

export interface RoleLike extends RoleFacts {
  roleId: number;
  name: string;
  coin: RoleSummary['coin'];
}

const inRoleOrder = (left: RoleLike, right: RoleLike): number =>
  left.name.localeCompare(right.name, 'de');

export const isRoleArchived = (role: RoleFacts): boolean => role.archivedOn !== null;

export const toSeatedOffices = (role: RoleFacts): ImpliedByOffice[] =>
  role.impliedBy.filter((office) => office.seatedCount > 0);

export const hasNoRights = (role: RoleFacts): boolean => role.permissionKeys.length === 0;

export const isFullSet = (role: RoleFacts, totalKeys: number): boolean =>
  totalKeys > 0 && role.permissionKeys.length === totalKeys;

export const toRoleMarkState = (role: RoleFacts): KkRoleMarkState =>
  isRoleArchived(role) ? 'archived' : 'active';

export const toActiveRoles = <TRole extends RoleLike>(roles: readonly TRole[]): TRole[] =>
  roles.filter((role) => !isRoleArchived(role)).sort(inRoleOrder);

export const toArchivedRoles = <TRole extends RoleLike>(roles: readonly TRole[]): TRole[] =>
  roles.filter(isRoleArchived).sort(inRoleOrder);

export interface RightEntry {
  key: PermissionKey;
  roles: RoleLike[];
}

export const toRightEntries = (
  roles: readonly RoleLike[],
  catalogue: readonly string[],
): RightEntry[] => {
  const active = toActiveRoles(roles);

  return catalogue.filter(isPermissionKey).map((key) => ({
    key,
    roles: active.filter((role) => role.permissionKeys.includes(key)),
  }));
};

export interface RightGroupDefinition {
  id: string;
  keys: readonly string[];
}

export interface RightGroup {
  id: string;
  entries: RightEntry[];
}

export const OTHER_RIGHTS_GROUP = 'other';

export const toRightGroups = (
  entries: readonly RightEntry[],
  definitions: readonly RightGroupDefinition[],
): RightGroup[] => {
  const known = new Set(definitions.flatMap((definition) => definition.keys));
  const groups: RightGroup[] = [
    ...definitions.map((definition) => ({
      id: definition.id,
      entries: entries.filter((entry) => definition.keys.includes(entry.key)),
    })),
    { id: OTHER_RIGHTS_GROUP, entries: entries.filter((entry) => !known.has(entry.key)) },
  ];

  return groups.filter((group) => group.entries.length > 0);
};

export const HOLDERS_SHOWN = 2;

export interface HolderPreview<THolder> {
  shown: THolder[];
  more: number;
}

export const toHolderPreview = <THolder>(holders: readonly THolder[]): HolderPreview<THolder> => ({
  shown: holders.slice(0, HOLDERS_SHOWN),
  more: Math.max(holders.length - HOLDERS_SHOWN, 0),
});

export type HolderPhase = 'running' | 'ending' | 'planned' | 'past';

interface Span {
  sinceOn: string;
  untilOn: string | null;
}

export const holderPhaseOf = (span: Span, today: string): HolderPhase => {
  if (span.untilOn !== null && span.untilOn < today) {
    return 'past';
  }
  if (span.sinceOn > today) {
    return 'planned';
  }

  return span.untilOn === null ? 'running' : 'ending';
};

export interface HolderGroups {
  current: RoleHolder[];
  planned: RoleHolder[];
}

export const toHolderGroups = (holders: readonly RoleHolder[], today: string): HolderGroups => {
  const bySince = (left: RoleHolder, right: RoleHolder): number =>
    left.sinceOn.localeCompare(right.sinceOn);
  const phased = holders.map((holder) => ({ holder, phase: holderPhaseOf(holder, today) }));

  return {
    current: phased
      .filter(({ phase }) => phase === 'running' || phase === 'ending')
      .map(({ holder }) => holder)
      .sort(bySince),
    planned: phased
      .filter(({ phase }) => phase === 'planned')
      .map(({ holder }) => holder)
      .sort(bySince),
  };
};

export const toPastHolders = (holders: readonly RoleHolder[]): RoleHolder[] =>
  [...holders].sort((left, right) =>
    (right.untilOn ?? right.sinceOn).localeCompare(left.untilOn ?? left.sinceOn),
  );

export const toTabState = (tab: RolePaneTab, role: RoleFacts): KkStepState => {
  if (tab === 'settings') {
    return 'open';
  }
  if (isRoleArchived(role)) {
    return 'off';
  }
  if (tab === 'holders') {
    return 'open';
  }

  return hasNoRights(role) ? 'open' : 'done';
};

export type PrimaryAction = 'addHolder' | 'edit';

export const primaryActionOf = (tab: RolePaneTab, role: RoleFacts): PrimaryAction | null => {
  if (isRoleArchived(role)) {
    return null;
  }

  switch (tab) {
    case 'holders':
      return 'addHolder';
    case 'settings':
      return 'edit';
    case 'rights':
      return null;
  }
};

export const DEFAULT_TAB: RolePaneTab = 'rights';

export const toOfficeNames = (offices: readonly ImpliedByOffice[]): string =>
  offices.map((office) => office.name).join(', ');

export const ROLE_LANDING_KIND = 'role';

export type EditorReturn = 'new' | 'hub' | 'role';

export const toEditorLanding = (roleId: number, returnTo: EditorReturn): WriteLanding => {
  const mark = { kind: ROLE_LANDING_KIND, id: roleId };

  switch (returnTo) {
    case 'role':
      return { to: '/manage/roles/$roleId', params: { roleId }, mark };
    case 'hub':
    case 'new':
      return { to: '/manage/roles', search: { role: roleId }, mark };
  }
};

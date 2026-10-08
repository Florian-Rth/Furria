import type { GroupRef, RoleRef } from '@/lib/api/schemas';

export const NO_AFFILIATION_META = 'keine Gruppe, keine Rolle';

const META_SEPARATOR = ' · ';

export interface PersonRowAffiliation {
  accent?: string;
  meta?: string;
}

const toAccent = (roles: readonly RoleRef[]): string | undefined => {
  const [first, ...further] = roles;

  if (first === undefined) {
    return undefined;
  }
  if (further.length === 0) {
    return first.name;
  }

  return `${first.name} +${further.length}`;
};

const toMeta = (groups: readonly GroupRef[]): string | undefined => {
  if (groups.length === 0) {
    return undefined;
  }

  return groups.map((group) => group.name).join(META_SEPARATOR);
};

export const toPersonRowAffiliation = (
  groups: readonly GroupRef[],
  roles: readonly RoleRef[],
): PersonRowAffiliation => ({ accent: toAccent(roles), meta: toMeta(groups) });

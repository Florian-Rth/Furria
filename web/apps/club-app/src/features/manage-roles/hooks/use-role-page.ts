import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import type { UseQueryResult } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { parsePositiveId } from '@/lib/positive-id';
import { useRolesQuery } from '../api';
import type { RoleSummary, RolesResponse } from '../schemas';
import type { HoldingFormTargetControl } from './use-holding-form-target';
import { useHoldingFormTarget } from './use-holding-form-target';

const ROLE_ROUTE_ID = '/_app/manage/roles_/$roleId';
const NO_ROLES: readonly RoleSummary[] = [];
const NO_KEYS: readonly string[] = [];

export interface RolePageControl {
  query: UseQueryResult<RolesResponse, Error>;
  roles: readonly RoleSummary[];
  role: RoleSummary | null;
  catalogue: readonly string[];
  today: string;
  isWide: boolean;
  form: HoldingFormTargetControl;
  reload: () => void;
}

export const useRolePage = (): RolePageControl => {
  const { roleId } = useParams({ from: ROLE_ROUTE_ID });
  const { has } = usePermissions();
  const query = useRolesQuery(has(PERMISSION_KEYS.rolesManage));
  const isWide = useIsWideScreen();
  const form = useHoldingFormTarget();
  const id = parsePositiveId(roleId);
  const roles = query.data?.roles ?? NO_ROLES;

  return {
    query,
    roles,
    role: roles.find((candidate) => candidate.roleId === id) ?? null,
    catalogue: query.data?.permissionKeys ?? NO_KEYS,
    today: toIsoDay(new Date()),
    isWide,
    form,
    reload: () => {
      void query.refetch();
    },
  };
};

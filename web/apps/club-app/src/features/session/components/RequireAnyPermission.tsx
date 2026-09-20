import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { AccessDenied } from './AccessDenied';

const DENIED_MESSAGE = 'Die Verwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.';

interface RequireAnyPermissionProps extends PropsWithChildren {
  permissionKeys: readonly PermissionKey[];
}

export const RequireAnyPermission: FC<RequireAnyPermissionProps> = ({
  permissionKeys,
  children,
}) => {
  const { has, isUndecided } = usePermissions();
  const isPermitted = permissionKeys.some((key) => has(key));

  if (isUndecided || isPermitted) {
    return children;
  }

  return <AccessDenied message={DENIED_MESSAGE} />;
};

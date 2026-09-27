import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { deniedMessageOf } from '../permission-denials';
import { AccessDenied } from './AccessDenied';

interface RequireAnyPermissionProps extends PropsWithChildren {
  permissionKeys: readonly [PermissionKey, ...PermissionKey[]];
}

export const RequireAnyPermission: FC<RequireAnyPermissionProps> = ({
  permissionKeys,
  children,
}) => {
  const { has, isUndecided } = usePermissions();
  const isPermitted = permissionKeys.some((key) => has(key));
  const [leadingKey] = permissionKeys;

  if (isUndecided || isPermitted) {
    return children;
  }

  return <AccessDenied message={deniedMessageOf(leadingKey)} />;
};

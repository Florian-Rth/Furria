import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { deniedMessageOf } from '../permission-denials';
import { AccessDenied } from './AccessDenied';

interface RequirePermissionProps extends PropsWithChildren {
  permissionKey: PermissionKey;
}

export const RequirePermission: FC<RequirePermissionProps> = ({ permissionKey, children }) => {
  const { has, isUndecided } = usePermissions();

  if (isUndecided || has(permissionKey)) {
    return children;
  }

  return <AccessDenied message={deniedMessageOf(permissionKey)} />;
};

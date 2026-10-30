import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { deniedMessageOf } from '../permission-denials';
import type { AccessDeniedFrame } from './AccessDeniedScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { AccessPendingScreen } from './AccessPendingScreen';

type RequireScreenPermissionProps = PropsWithChildren<{ permissionKey: PermissionKey }> &
  AccessDeniedFrame;

export const RequireScreenPermission: FC<RequireScreenPermissionProps> = ({
  permissionKey,
  children,
  ...frame
}) => {
  const { has, isUndecided } = usePermissions();

  if (has(permissionKey)) {
    return children;
  }
  if (isUndecided) {
    return <AccessPendingScreen {...frame} />;
  }

  return <AccessDeniedScreen {...frame} message={deniedMessageOf(permissionKey)} />;
};

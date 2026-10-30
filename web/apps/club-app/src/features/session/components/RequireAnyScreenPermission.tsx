import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { MANAGE_DENIED_MESSAGE } from '../permission-denials';
import type { AccessDeniedFrame } from './AccessDeniedScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { AccessPendingScreen } from './AccessPendingScreen';

type RequireAnyScreenPermissionProps = PropsWithChildren<{
  permissionKeys: readonly PermissionKey[];
}> &
  AccessDeniedFrame;

export const RequireAnyScreenPermission: FC<RequireAnyScreenPermissionProps> = ({
  permissionKeys,
  children,
  ...frame
}) => {
  const { has, isUndecided } = usePermissions();
  const isPermitted = permissionKeys.some((key) => has(key));

  if (isPermitted) {
    return children;
  }
  if (isUndecided) {
    return <AccessPendingScreen {...frame} />;
  }

  return <AccessDeniedScreen {...frame} message={MANAGE_DENIED_MESSAGE} />;
};

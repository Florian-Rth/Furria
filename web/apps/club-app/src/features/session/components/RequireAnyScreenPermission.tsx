import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { MANAGE_DENIED_MESSAGE } from '../permission-denials';
import type { AccessDeniedFrame } from './AccessDeniedScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';

type RequireAnyScreenPermissionProps = PropsWithChildren<{
  permissionKeys: readonly PermissionKey[];
}> &
  AccessDeniedFrame;

export const RequireAnyScreenPermission: FC<RequireAnyScreenPermissionProps> = ({
  permissionKeys,
  title,
  section,
  origin,
  children,
}) => {
  const { has, isUndecided } = usePermissions();
  const isPermitted = permissionKeys.some((key) => has(key));

  if (isUndecided || isPermitted) {
    return children;
  }

  if (section === undefined) {
    return <AccessDeniedScreen title={title} origin={origin} message={MANAGE_DENIED_MESSAGE} />;
  }

  return <AccessDeniedScreen title={title} section={section} message={MANAGE_DENIED_MESSAGE} />;
};

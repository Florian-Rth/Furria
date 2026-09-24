import type { FC, PropsWithChildren } from 'react';
import type { PermissionKey } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { deniedMessageOf } from '../permission-denials';
import type { AccessDeniedFrame } from './AccessDeniedScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';

type RequireScreenPermissionProps = PropsWithChildren<{ permissionKey: PermissionKey }> &
  AccessDeniedFrame;

export const RequireScreenPermission: FC<RequireScreenPermissionProps> = ({
  permissionKey,
  title,
  section,
  origin,
  children,
}) => {
  const { has, isUndecided } = usePermissions();

  if (isUndecided || has(permissionKey)) {
    return children;
  }

  const message = deniedMessageOf(permissionKey);

  if (section === undefined) {
    return <AccessDeniedScreen title={title} origin={origin} message={message} />;
  }

  return <AccessDeniedScreen title={title} section={section} message={message} />;
};

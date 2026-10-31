import type { FC, PropsWithChildren } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import { NO_PERSON_MESSAGE } from '../permission-denials';
import type { AccessDeniedFrame } from './AccessDeniedScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { AccessPendingScreen } from './AccessPendingScreen';

type RequirePersonProps = PropsWithChildren<AccessDeniedFrame>;

export const RequirePerson: FC<RequirePersonProps> = ({ children, ...frame }) => {
  const { isManagingLogin, isUndecided } = usePermissions();

  if (isUndecided) {
    return <AccessPendingScreen {...frame} />;
  }
  if (!isManagingLogin) {
    return children;
  }

  return <AccessDeniedScreen {...frame} message={NO_PERSON_MESSAGE} />;
};

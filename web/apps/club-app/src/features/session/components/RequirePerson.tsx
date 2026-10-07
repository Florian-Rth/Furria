import type { FC, PropsWithChildren } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import { NO_PERSON_MESSAGE } from '../permission-denials';
import type { AccessDeniedFrame } from './AccessDeniedScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';

type RequirePersonProps = PropsWithChildren<AccessDeniedFrame>;

export const RequirePerson: FC<RequirePersonProps> = ({ title, section, origin, children }) => {
  const { isManagingLogin } = usePermissions();

  if (!isManagingLogin) {
    return children;
  }
  if (section === undefined) {
    return <AccessDeniedScreen title={title} origin={origin} message={NO_PERSON_MESSAGE} />;
  }

  return <AccessDeniedScreen title={title} section={section} message={NO_PERSON_MESSAGE} />;
};

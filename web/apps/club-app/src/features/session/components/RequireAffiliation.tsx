import type { FC, PropsWithChildren } from 'react';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePermissions } from '../hooks/use-permissions';
import { deniedMessageOf } from '../permission-denials';
import type { ScreenFrame } from '../screen-frame';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { NotAffiliatedScreen } from './NotAffiliatedScreen';

const MEMBERS_ONLY_TITLE = 'Kein Zugang';
const MEMBERS_ONLY_MESSAGE = deniedMessageOf(PERMISSION_KEYS.clubRead);

type RequireAffiliationProps = PropsWithChildren<ScreenFrame>;

export const RequireAffiliation: FC<RequireAffiliationProps> = ({ section, origin, children }) => {
  const { isAffiliated, isManagingLogin, isUndecided } = usePermissions();

  if (isUndecided || isAffiliated) {
    return children;
  }
  if (isManagingLogin && section === undefined) {
    return (
      <AccessDeniedScreen
        title={MEMBERS_ONLY_TITLE}
        origin={origin}
        message={MEMBERS_ONLY_MESSAGE}
      />
    );
  }
  if (isManagingLogin && section !== undefined) {
    return (
      <AccessDeniedScreen
        title={MEMBERS_ONLY_TITLE}
        section={section}
        message={MEMBERS_ONLY_MESSAGE}
      />
    );
  }
  if (section === undefined) {
    return <NotAffiliatedScreen origin={origin} />;
  }

  return <NotAffiliatedScreen section={section} />;
};

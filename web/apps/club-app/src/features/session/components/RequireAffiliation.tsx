import type { FC, PropsWithChildren } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import type { ScreenFrame } from '../screen-frame';
import { NotAffiliatedScreen } from './NotAffiliatedScreen';

type RequireAffiliationProps = PropsWithChildren<ScreenFrame>;

export const RequireAffiliation: FC<RequireAffiliationProps> = ({ section, origin, children }) => {
  const { isAffiliated, isUndecided } = usePermissions();

  if (isUndecided || isAffiliated) {
    return children;
  }
  if (section === undefined) {
    return <NotAffiliatedScreen origin={origin} />;
  }

  return <NotAffiliatedScreen section={section} />;
};

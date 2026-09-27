import type { FC, PropsWithChildren } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import { NotAffiliatedScreen } from './NotAffiliatedScreen';

export const RequireAffiliation: FC<PropsWithChildren> = ({ children }) => {
  const { isAffiliated, isUndecided } = usePermissions();

  if (isUndecided || isAffiliated) {
    return children;
  }

  return <NotAffiliatedScreen />;
};

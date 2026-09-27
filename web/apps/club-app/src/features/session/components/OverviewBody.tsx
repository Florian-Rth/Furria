import { KkPageWatermark } from '@furria/ui';
import type { FC } from 'react';
import { usePermissions } from '../hooks/use-permissions';
import { NotAffiliatedState } from './NotAffiliatedState';

export const OverviewBody: FC = () => {
  const { isAffiliated, isUndecided } = usePermissions();

  if (isUndecided || isAffiliated) {
    return <KkPageWatermark />;
  }

  return <NotAffiliatedState />;
};

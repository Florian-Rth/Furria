import type { FC, PropsWithChildren } from 'react';
import { useMeQuery } from '../api';
import { toMeErrorMessage } from '../session-messages';
import { MeFailure } from './MeFailure';

export const RequireMe: FC<PropsWithChildren> = ({ children }) => {
  const me = useMeQuery();
  const errorMessage = toMeErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (me.data === undefined && errorMessage !== null) {
    return <MeFailure message={errorMessage} onRetry={reload} />;
  }

  return children;
};

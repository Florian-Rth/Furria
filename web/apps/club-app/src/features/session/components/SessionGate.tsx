import { Navigate } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { buildLoginSearch } from '@/lib/login-redirect';
import { useSessionSnapshot } from '../hooks/use-session-snapshot';

interface SessionGateProps extends PropsWithChildren {
  returnTo: string;
}

export const SessionGate: FC<SessionGateProps> = ({ returnTo, children }) => {
  const { status, expired } = useSessionSnapshot();
  const loginSearch = buildLoginSearch(returnTo, expired);

  if (status === 'anonymous') {
    return <Navigate to="/login" search={loginSearch} replace />;
  }

  return children;
};

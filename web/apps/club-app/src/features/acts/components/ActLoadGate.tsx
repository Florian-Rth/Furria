import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC, ReactNode } from 'react';
import { START_ORIGIN } from '@/features/session/app-sections';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { ACT_DENIED_MESSAGE } from '../act-page-copy';
import type { ActLoad } from '../hooks/use-act-load';
import { ActPageLoading } from './ActPageLoading';

interface ActLoadGateProps {
  load: ActLoad;
  title: string;
  origin: KkScreenOrigin;
  children: ReactNode;
}

export const ActLoadGate: FC<ActLoadGateProps> = ({ load, title, origin, children }) => {
  if (load.actId === null || isNotFoundError(load.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(load.query.error)) {
    return <AccessDeniedScreen title={title} origin={START_ORIGIN} message={ACT_DENIED_MESSAGE} />;
  }
  if (load.query.data === undefined) {
    return (
      <KkScreen kind="detail" title={title} origin={origin}>
        <ActPageLoading load={load} />
      </KkScreen>
    );
  }

  return children;
};

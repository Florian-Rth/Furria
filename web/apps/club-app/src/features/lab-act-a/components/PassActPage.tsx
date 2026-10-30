import { KkDensePanelSkeleton } from '@furria/ui/KkDensePanelSkeleton';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { ACT_DENIED_MESSAGE, ACT_LOADING_LABEL } from '@/features/acts/act-page-copy';
import { START_ORIGIN } from '@/features/session/app-sections';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { usePassActPage } from '../hooks/use-pass-act-page';
import { ACT_LOAD_FAILED } from '../pass-copy';
import { PassActBody } from './PassActBody';

interface PassActPageProps {
  actId: string;
}

export const PassActPage: FC<PassActPageProps> = ({ actId }) => {
  const page = usePassActPage(actId);

  if (page.status === 'notFound') {
    return <ScreenNotFound />;
  }
  if (page.status === 'forbidden') {
    return (
      <AccessDeniedScreen title={page.title} origin={START_ORIGIN} message={ACT_DENIED_MESSAGE} />
    );
  }

  const body =
    page.act === null ? (
      <AppSkeletonRegion label={ACT_LOADING_LABEL}>
        <KkDensePanelSkeleton />
      </AppSkeletonRegion>
    ) : (
      <PassActBody page={page} act={page.act} />
    );
  const failure =
    page.status === 'failed' ? (
      <KkRetryAlert message={ACT_LOAD_FAILED} retrying={page.retrying} onRetry={page.retry} />
    ) : null;

  return (
    <KkScreen kind="detail" title={page.title} origin={page.origin}>
      {failure}
      {body}
    </KkScreen>
  );
};

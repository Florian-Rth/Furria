import { MUSIC_PAGE_CLOSED } from '@furria/studio/step-cards-copy';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC, ReactNode } from 'react';
import { RETRY_LABEL } from '@/features/acts/acts-copy';
import { ACT_ERROR_MESSAGES } from '@/features/acts/acts-messages';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';
import type { ActStudioPage } from '../hooks/use-act-studio-page';

interface ActStudioPageGateProps {
  page: ActStudioPage;
  title: string;
  heading: string | null;
  deniedTitle: string;
  deniedMessage: string;
  children: ReactNode;
}

const SKELETON_LINES = 8;

export const ActStudioPageGate: FC<ActStudioPageGateProps> = ({
  page,
  title,
  heading,
  deniedTitle,
  deniedMessage,
  children,
}) => {
  const { query } = page;
  const data = query.data;

  if (page.actId === null || isNotFoundError(query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(query.error) || (data !== undefined && !page.canEdit)) {
    return <AccessDeniedScreen title={deniedTitle} origin={page.origin} message={deniedMessage} />;
  }

  const failure = toQueryErrorMessage(query.error, ACT_ERROR_MESSAGES);
  const pending =
    failure === null ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : (
      <KkRetryAlert
        message={failure}
        retrying={query.isFetching}
        onRetry={page.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  const loaded =
    data?.studio === null || data?.studio === undefined ? (
      <KkEmptyState title={page.actName} description={MUSIC_PAGE_CLOSED} />
    ) : (
      children
    );
  const body = data === undefined ? pending : loaded;
  const hidden =
    heading === null ? null : <KkVisuallyHidden component="h1">{heading}</KkVisuallyHidden>;

  return (
    <KkScreen kind="fullscreen" title={title} origin={page.origin}>
      {hidden}
      {body}
    </KkScreen>
  );
};

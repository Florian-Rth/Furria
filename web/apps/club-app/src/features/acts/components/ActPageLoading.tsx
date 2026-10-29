import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { toQueryErrorMessage } from '@/lib/query-error';
import { ACT_LOADING_LABEL } from '../act-page-copy';
import { RETRY_LABEL } from '../acts-copy';
import { ACTS_ERROR_MESSAGES } from '../acts-messages';
import type { ActPageState } from '../hooks/use-act-page';

const SKELETON_LINES = 8;

interface ActPageLoadingProps {
  page: ActPageState;
}

export const ActPageLoading: FC<ActPageLoadingProps> = ({ page }) => {
  const message = toQueryErrorMessage(page.query.error, ACTS_ERROR_MESSAGES);

  return message === null ? (
    <AppSkeletonRegion label={ACT_LOADING_LABEL}>
      <KkSkeletonBlock lines={SKELETON_LINES} />
    </AppSkeletonRegion>
  ) : (
    <KkRetryAlert
      message={message}
      retrying={page.query.isFetching}
      onRetry={page.reload}
      retryLabel={RETRY_LABEL}
    />
  );
};

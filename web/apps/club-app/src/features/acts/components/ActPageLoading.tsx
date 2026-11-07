import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { toQueryErrorMessage } from '@/lib/query-error';
import { ACT_LOADING_LABEL } from '../act-page-copy';
import { RETRY_LABEL } from '../acts-copy';
import { ACT_ERROR_MESSAGES } from '../acts-messages';
import type { ActLoad } from '../hooks/use-act-load';

const SKELETON_LINES = 8;

interface ActPageLoadingProps {
  load: ActLoad;
}

export const ActPageLoading: FC<ActPageLoadingProps> = ({ load }) => {
  const message = toQueryErrorMessage(load.query.error, ACT_ERROR_MESSAGES);

  return message === null ? (
    <AppSkeletonRegion label={ACT_LOADING_LABEL}>
      <KkSkeletonBlock lines={SKELETON_LINES} />
    </AppSkeletonRegion>
  ) : (
    <KkRetryAlert
      message={message}
      retrying={load.query.isFetching}
      onRetry={load.reload}
      retryLabel={RETRY_LABEL}
    />
  );
};

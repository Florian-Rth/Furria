import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { UseQueryResult } from '@tanstack/react-query';
import type { FC } from 'react';
import { ACTS_ERROR_MESSAGES } from '@/features/acts/acts-messages';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { toQueryErrorMessage } from '@/lib/query-error';
import {
  STUDIO_B_LOADING_LABEL,
  STUDIO_B_NO_STEPS_LINE,
  STUDIO_B_NO_STEPS_TITLE,
  STUDIO_B_NO_STUDIO_LINE,
  STUDIO_B_NO_STUDIO_TITLE,
  STUDIO_B_RETRY_LABEL,
} from '../studio-b-copy';
import { StudioBPractice } from './StudioBPractice';

const SKELETON_LINES = 12;

interface StudioBBodyProps {
  query: UseQueryResult<ActStudioResponse, Error>;
  viewerId: number | null;
}

export const StudioBBody: FC<StudioBBodyProps> = ({ query, viewerId }) => {
  const data = query.data;

  if (data === undefined) {
    const message = toQueryErrorMessage(query.error, ACTS_ERROR_MESSAGES);
    const retry = (): void => {
      void query.refetch();
    };

    return message === null ? (
      <AppSkeletonRegion label={STUDIO_B_LOADING_LABEL}>
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </AppSkeletonRegion>
    ) : (
      <KkRetryAlert
        message={message}
        retrying={query.isFetching}
        onRetry={retry}
        retryLabel={STUDIO_B_RETRY_LABEL}
      />
    );
  }

  if (data.studio === null) {
    return (
      <KkEmptyState
        size="panel"
        title={STUDIO_B_NO_STUDIO_TITLE}
        description={STUDIO_B_NO_STUDIO_LINE}
      />
    );
  }

  if (data.studio.steps.length === 0) {
    return (
      <KkEmptyState
        size="panel"
        title={STUDIO_B_NO_STEPS_TITLE}
        description={STUDIO_B_NO_STEPS_LINE}
      />
    );
  }

  return <StudioBPractice act={data.act} studio={data.studio} viewerId={viewerId} />;
};

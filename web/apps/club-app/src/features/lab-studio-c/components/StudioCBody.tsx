import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { RETRY_LABEL } from '@/features/acts/acts-copy';
import { ACTS_ERROR_MESSAGES } from '@/features/acts/acts-messages';
import type { LabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { toQueryErrorMessage } from '@/lib/query-error';
import {
  STUDIO_C_LOADING_TITLE,
  STUDIO_C_LOCKED_LINE,
  STUDIO_C_LOCKED_TITLE,
} from '../studio-c-copy';
import { StudioCDesk } from './StudioCDesk';

const SKELETON_LINES = 10;

interface StudioCBodyProps {
  lab: LabStudio;
}

export const StudioCBody: FC<StudioCBodyProps> = ({ lab }) => {
  const data = lab.query.data;
  const retry = (): void => {
    void lab.query.refetch();
  };

  if (data === undefined) {
    const message = toQueryErrorMessage(lab.query.error, ACTS_ERROR_MESSAGES);

    return message === null ? (
      <AppSkeletonRegion label={STUDIO_C_LOADING_TITLE}>
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </AppSkeletonRegion>
    ) : (
      <KkRetryAlert
        message={message}
        retrying={lab.query.isFetching}
        onRetry={retry}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  if (data.studio === null) {
    return <KkEmptyState title={STUDIO_C_LOCKED_TITLE} description={STUDIO_C_LOCKED_LINE} />;
  }

  return <StudioCDesk studio={data.studio} viewerId={lab.viewerId} />;
};

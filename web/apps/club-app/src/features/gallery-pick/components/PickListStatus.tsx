import { KkRetryAlert, KkSkeletonRow, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PICK_RETRY } from '../gallery-pick-copy';
import type { PickListPhase } from '../pick-list';

const SKELETON_ROWS = 3;

interface PickListStatusProps {
  phase: PickListPhase;
  loadingLabel: string;
  errorMessage: string | null;
  emptyNote: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const PickListStatus: FC<PickListStatusProps> = ({
  phase,
  loadingLabel,
  errorMessage,
  emptyNote,
  isRetrying,
  onRetry,
}) => {
  if (phase === 'loading') {
    return (
      <Stack role="status" aria-label={loadingLabel}>
        <KkSkeletonRow count={SKELETON_ROWS} shape="select" />
      </Stack>
    );
  }
  if (phase === 'failed' && errorMessage !== null) {
    return (
      <KkRetryAlert
        message={errorMessage}
        retrying={isRetrying}
        onRetry={onRetry}
        retryLabel={PICK_RETRY}
      />
    );
  }
  if (phase === 'empty') {
    return <KkText variant="body2">{emptyNote}</KkText>;
  }
  return null;
};

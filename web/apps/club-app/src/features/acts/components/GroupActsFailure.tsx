import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { toQueryErrorMessage } from '@/lib/query-error';
import { GROUP_ACTS_TITLE, RETRY_LABEL } from '../acts-copy';
import { ACTS_ERROR_MESSAGES } from '../acts-messages';

interface GroupActsFailureProps {
  origin: KkScreenOrigin;
  error: Error;
  retrying: boolean;
  onRetry: () => void;
}

export const GroupActsFailure: FC<GroupActsFailureProps> = ({
  origin,
  error,
  retrying,
  onRetry,
}) => {
  const message = toQueryErrorMessage(error, ACTS_ERROR_MESSAGES) ?? ACTS_ERROR_MESSAGES.unexpected;

  return (
    <KkScreen kind="working" title={GROUP_ACTS_TITLE} origin={origin}>
      <KkRetryAlert
        message={message}
        retrying={retrying}
        onRetry={onRetry}
        retryLabel={RETRY_LABEL}
      />
    </KkScreen>
  );
};

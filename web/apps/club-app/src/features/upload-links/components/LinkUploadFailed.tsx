import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { FAILED_LINE, FAILED_TITLE, RETRY_LABEL } from '../upload-link-copy';

interface LinkUploadFailedProps {
  retrying: boolean;
  onRetry: () => void;
}

export const LinkUploadFailed: FC<LinkUploadFailedProps> = ({ retrying, onRetry }) => {
  const retry = (
    <KkButton loading={retrying} onClick={onRetry}>
      {RETRY_LABEL}
    </KkButton>
  );

  return <KkErrorState title={FAILED_TITLE} description={FAILED_LINE} action={retry} />;
};

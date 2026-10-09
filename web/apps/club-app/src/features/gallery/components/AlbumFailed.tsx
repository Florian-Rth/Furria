import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';
import { FAILED_DESCRIPTION, FAILED_TITLE, RETRY_LABEL } from '../album-labels';

interface AlbumFailedProps {
  onRetry: () => void;
}

export const AlbumFailed: FC<AlbumFailedProps> = ({ onRetry }) => {
  const action = (
    <KkButton variant="outlined" onClick={onRetry}>
      {RETRY_LABEL}
    </KkButton>
  );

  return <KkErrorState title={FAILED_TITLE} description={FAILED_DESCRIPTION} action={action} />;
};

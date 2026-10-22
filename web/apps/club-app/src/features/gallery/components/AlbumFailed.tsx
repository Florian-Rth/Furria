import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { toAlbumErrorMessage } from '../album-form-messages';
import { FAILED_TITLE, RETRY_LABEL } from '../album-labels';

interface AlbumFailedProps {
  error: Error | null;
  retrying: boolean;
  onRetry: () => void;
}

export const AlbumFailed: FC<AlbumFailedProps> = ({ error, retrying, onRetry }) => {
  const description = toAlbumErrorMessage(error) ?? '';
  const action = (
    <KkButton variant="outlined" loading={retrying} onClick={onRetry}>
      {RETRY_LABEL}
    </KkButton>
  );

  return <KkErrorState title={FAILED_TITLE} description={description} action={action} />;
};

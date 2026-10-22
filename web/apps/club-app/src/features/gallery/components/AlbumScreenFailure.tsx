import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';

const FAILURE_TITLE = 'ALBUM NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface AlbumScreenFailureProps {
  title: string;
  origin: KkScreenOrigin;
  message: string;
  retrying: boolean;
  onRetry: () => void;
}

export const AlbumScreenFailure: FC<AlbumScreenFailureProps> = ({
  title,
  origin,
  message,
  retrying,
  onRetry,
}) => (
  <KkScreen kind="fullscreen" title={title} origin={origin}>
    <KkErrorState
      title={FAILURE_TITLE}
      description={message}
      action={
        <KkButton loading={retrying} onClick={onRetry}>
          {RETRY_LABEL}
        </KkButton>
      }
    />
  </KkScreen>
);

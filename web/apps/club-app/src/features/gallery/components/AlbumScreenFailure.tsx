import type { KkScreenOrigin } from '@furria/ui';
import { KkButton, KkErrorState, KkScreen } from '@furria/ui';
import type { FC } from 'react';

const FAILURE_TITLE = 'ALBUM NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface AlbumScreenFailureProps {
  title: string;
  origin: KkScreenOrigin;
  message: string;
  onRetry: () => void;
}

export const AlbumScreenFailure: FC<AlbumScreenFailureProps> = ({
  title,
  origin,
  message,
  onRetry,
}) => (
  <KkScreen kind="fullscreen" title={title} origin={origin}>
    <KkErrorState
      title={FAILURE_TITLE}
      description={message}
      action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
    />
  </KkScreen>
);

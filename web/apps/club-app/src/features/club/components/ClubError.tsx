import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_RETRY_LABEL } from '../club-labels';

const TITLE = 'VEREIN NICHT GELADEN';

interface ClubErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const ClubError: FC<ClubErrorProps> = ({ message, isRetrying, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={
      <KkButton loading={isRetrying} onClick={onRetry}>
        {CLUB_RETRY_LABEL}
      </KkButton>
    }
  />
);

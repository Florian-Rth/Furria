import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'VERANSTALTUNG NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface EventErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const EventError: FC<EventErrorProps> = ({ message, isRetrying, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={
      <KkButton loading={isRetrying} onClick={onRetry}>
        {RETRY_LABEL}
      </KkButton>
    }
  />
);

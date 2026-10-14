import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'KARTENANFRAGEN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface TicketRequestsErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const TicketRequestsError: FC<TicketRequestsErrorProps> = ({
  message,
  isRetrying,
  onRetry,
}) => (
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

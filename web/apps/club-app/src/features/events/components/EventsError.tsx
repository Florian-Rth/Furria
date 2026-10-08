import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'VERANSTALTUNGEN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface EventsErrorProps {
  message: string;
  onRetry: () => void;
}

export const EventsError: FC<EventsErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

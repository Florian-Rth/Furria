import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'VERANSTALTUNG NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface EventErrorProps {
  message: string;
  onRetry: () => void;
}

export const EventError: FC<EventErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

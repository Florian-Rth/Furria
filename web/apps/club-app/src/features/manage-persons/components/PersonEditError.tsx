import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'PERSON NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface PersonEditErrorProps {
  message: string;
  onRetry: () => void;
}

export const PersonEditError: FC<PersonEditErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

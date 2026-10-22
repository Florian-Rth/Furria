import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const TITLE = 'REGISTER NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface PersonsErrorProps {
  message: string;
  onRetry: () => void;
}

export const PersonsError: FC<PersonsErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

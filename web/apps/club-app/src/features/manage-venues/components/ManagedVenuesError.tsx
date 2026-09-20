import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'ORTE NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface ManagedVenuesErrorProps {
  message: string;
  onRetry: () => void;
}

export const ManagedVenuesError: FC<ManagedVenuesErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const TITLE = 'SCHLÜSSEL NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface ManagedKeysErrorProps {
  message: string;
  onRetry: () => void;
}

export const ManagedKeysError: FC<ManagedKeysErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

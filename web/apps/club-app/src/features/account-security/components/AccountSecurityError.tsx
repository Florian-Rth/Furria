import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface AccountSecurityErrorProps {
  message: string;
  onRetry: () => void;
}

export const AccountSecurityError: FC<AccountSecurityErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

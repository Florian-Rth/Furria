import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'ROLLEN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface RolesErrorProps {
  message: string;
  onRetry: () => void;
}

export const RolesError: FC<RolesErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

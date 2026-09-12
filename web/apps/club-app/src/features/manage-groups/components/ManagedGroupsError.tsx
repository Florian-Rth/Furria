import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'GRUPPEN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface ManagedGroupsErrorProps {
  message: string;
  onRetry: () => void;
}

export const ManagedGroupsError: FC<ManagedGroupsErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

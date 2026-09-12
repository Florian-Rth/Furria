import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'GRUPPE NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface GroupErrorProps {
  message: string;
  onRetry: () => void;
}

export const GroupError: FC<GroupErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

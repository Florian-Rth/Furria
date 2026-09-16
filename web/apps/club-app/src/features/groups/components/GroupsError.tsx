import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'GRUPPEN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface GroupsErrorProps {
  message: string;
  onRetry: () => void;
}

export const GroupsError: FC<GroupsErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

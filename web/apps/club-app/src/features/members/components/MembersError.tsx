import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'MITGLIEDERLISTE NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface MembersErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const MembersError: FC<MembersErrorProps> = ({ message, isRetrying, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={
      <KkButton loading={isRetrying} onClick={onRetry}>
        {RETRY_LABEL}
      </KkButton>
    }
  />
);

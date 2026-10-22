import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
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

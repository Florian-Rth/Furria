import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const TITLE = 'PERSON NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface MemberErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const MemberError: FC<MemberErrorProps> = ({ message, isRetrying, onRetry }) => (
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

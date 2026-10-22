import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const TITLE = 'NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface AccountSecurityErrorProps {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}

export const AccountSecurityError: FC<AccountSecurityErrorProps> = ({
  message,
  retrying,
  onRetry,
}) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={
      <KkButton loading={retrying} onClick={onRetry}>
        {RETRY_LABEL}
      </KkButton>
    }
  />
);

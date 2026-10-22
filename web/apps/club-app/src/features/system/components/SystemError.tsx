import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { RETRY_LABEL, STATUS_FAILED_TITLE } from '../system-copy';

interface SystemErrorProps {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}

export const SystemError: FC<SystemErrorProps> = ({ message, retrying, onRetry }) => (
  <KkErrorState
    title={STATUS_FAILED_TITLE}
    description={message}
    action={
      <KkButton loading={retrying} onClick={onRetry}>
        {RETRY_LABEL}
      </KkButton>
    }
  />
);

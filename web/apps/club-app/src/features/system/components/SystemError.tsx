import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';
import { RETRY_LABEL, STATUS_FAILED_MESSAGE, STATUS_FAILED_TITLE } from '../system-copy';

interface SystemErrorProps {
  onRetry: () => void;
}

export const SystemError: FC<SystemErrorProps> = ({ onRetry }) => (
  <KkErrorState
    title={STATUS_FAILED_TITLE}
    description={STATUS_FAILED_MESSAGE}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

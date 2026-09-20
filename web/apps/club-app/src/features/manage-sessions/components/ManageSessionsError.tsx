import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';
import {
  MANAGE_SESSIONS_ERROR_TITLE,
  MANAGE_SESSIONS_RETRY_LABEL,
} from '../manage-sessions-labels';

interface ManageSessionsErrorProps {
  message: string;
  onRetry: () => void;
}

export const ManageSessionsError: FC<ManageSessionsErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={MANAGE_SESSIONS_ERROR_TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{MANAGE_SESSIONS_RETRY_LABEL}</KkButton>}
  />
);

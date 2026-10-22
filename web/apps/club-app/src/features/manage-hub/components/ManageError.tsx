import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { MANAGE_ERROR_TITLE, MANAGE_RETRY_LABEL } from '../manage-hub-labels';

interface ManageErrorProps {
  message: string;
  onRetry: () => void;
}

export const ManageError: FC<ManageErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={MANAGE_ERROR_TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{MANAGE_RETRY_LABEL}</KkButton>}
  />
);

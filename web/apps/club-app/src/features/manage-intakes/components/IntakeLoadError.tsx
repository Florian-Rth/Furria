import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { RETRY_LABEL } from '../intake-labels';

interface IntakeLoadErrorProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export const IntakeLoadError: FC<IntakeLoadErrorProps> = ({ title, message, onRetry }) => (
  <KkErrorState
    title={title}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

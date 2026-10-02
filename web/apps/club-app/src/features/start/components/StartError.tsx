import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'GERADE NICHT ABRUFBAR';
const RETRY_LABEL = 'Erneut versuchen';

interface StartErrorProps {
  message: string;
  onRetry: () => void;
}

export const StartError: FC<StartErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'VEREIN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface ClubErrorProps {
  message: string;
  onRetry: () => void;
}

export const ClubError: FC<ClubErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'VORSTAND NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface BoardErrorProps {
  message: string;
  onRetry: () => void;
}

export const BoardError: FC<BoardErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

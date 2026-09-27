import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'VEREINSDATEN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface ClubRecordErrorProps {
  message: string;
  onRetry: () => void;
}

export const ClubRecordError: FC<ClubRecordErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

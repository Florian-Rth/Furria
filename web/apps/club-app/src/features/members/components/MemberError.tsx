import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'PERSON NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface MemberErrorProps {
  message: string;
  onRetry: () => void;
}

export const MemberError: FC<MemberErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

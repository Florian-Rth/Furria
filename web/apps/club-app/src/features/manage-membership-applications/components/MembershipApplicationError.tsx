import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const TITLE = 'ANTRAG NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface MembershipApplicationErrorProps {
  message: string;
  onRetry: () => void;
}

export const MembershipApplicationError: FC<MembershipApplicationErrorProps> = ({
  message,
  onRetry,
}) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'ANTRÄGE NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface MembershipApplicationsErrorProps {
  message: string;
  onRetry: () => void;
}

export const MembershipApplicationsError: FC<MembershipApplicationsErrorProps> = ({
  message,
  onRetry,
}) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

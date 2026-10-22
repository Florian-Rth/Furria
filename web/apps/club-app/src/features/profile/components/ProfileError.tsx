import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const TITLE = 'PROFIL NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface ProfileErrorProps {
  message: string;
  onRetry: () => void;
}

export const ProfileError: FC<ProfileErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
  />
);

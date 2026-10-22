import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';

const TITLE = 'GERADE NICHT ABRUFBAR';
const RETRY_LABEL = 'Erneut versuchen';

interface StartErrorProps {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}

export const StartError: FC<StartErrorProps> = ({ message, onRetry, retrying }) => (
  <KkErrorState
    title={TITLE}
    description={message}
    action={
      <KkButton onClick={onRetry} loading={retrying}>
        {RETRY_LABEL}
      </KkButton>
    }
  />
);

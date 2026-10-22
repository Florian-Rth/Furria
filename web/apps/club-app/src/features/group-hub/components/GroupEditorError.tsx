import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';

const ERROR_TITLE = 'NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';

interface GroupEditorErrorProps {
  title: string;
  origin: KkScreenOrigin;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const GroupEditorError: FC<GroupEditorErrorProps> = ({
  title,
  origin,
  message,
  onRetry,
  isRetrying = false,
}) => {
  const retry = (
    <KkButton onClick={onRetry} loading={isRetrying}>
      {RETRY_LABEL}
    </KkButton>
  );

  return (
    <KkScreen kind="fullscreen" title={title} origin={origin}>
      <KkErrorState title={ERROR_TITLE} description={message} action={retry} />
    </KkScreen>
  );
};

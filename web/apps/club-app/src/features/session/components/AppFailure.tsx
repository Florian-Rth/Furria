import { KkButton } from '@furria/ui/KkButton';
import type { ErrorComponentProps } from '@tanstack/react-router';
import type { FC } from 'react';
import { useRouteRetry } from '../hooks/use-route-retry';
import { BOOT_RETRY_LABEL, toAppErrorMessage } from '../session-messages';
import { StageFailure } from './StageFailure';

export const AppFailure: FC<ErrorComponentProps> = ({ error, reset }) => {
  const { retry, isRetrying } = useRouteRetry(reset);
  const message = toAppErrorMessage(error);

  const action = (
    <KkButton variant="outlined" loading={isRetrying} onClick={retry}>
      {BOOT_RETRY_LABEL}
    </KkButton>
  );

  return <StageFailure message={message} action={action} />;
};

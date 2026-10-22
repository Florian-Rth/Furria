import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import type { ErrorComponentProps } from '@tanstack/react-router';
import type { FC } from 'react';
import { START_ORIGIN } from '../app-sections';
import { useRouteRetry } from '../hooks/use-route-retry';
import {
  BOOT_RETRY_LABEL,
  SCREEN_FAILURE_BAR_TITLE,
  SCREEN_FAILURE_TITLE,
  toScreenErrorMessage,
} from '../session-messages';

export const ScreenFailure: FC<ErrorComponentProps> = ({ error, reset }) => {
  const { retry, isRetrying } = useRouteRetry(reset);
  const description = toScreenErrorMessage(error);

  const action = (
    <KkButton variant="outlined" loading={isRetrying} onClick={retry}>
      {BOOT_RETRY_LABEL}
    </KkButton>
  );

  return (
    <KkScreen kind="fullscreen" title={SCREEN_FAILURE_BAR_TITLE} origin={START_ORIGIN}>
      <KkErrorState title={SCREEN_FAILURE_TITLE} description={description} action={action} />
    </KkScreen>
  );
};

import { KkButton, KkErrorState, KkScreen } from '@furria/ui';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import { OVERVIEW_ORIGIN } from '../app-sections';
import {
  BOOT_RETRY_LABEL,
  SCREEN_FAILURE_BAR_TITLE,
  SCREEN_FAILURE_DESCRIPTION,
  SCREEN_FAILURE_TITLE,
} from '../session-messages';

export const ScreenFailure: FC<ErrorComponentProps> = ({ reset }) => {
  const router = useRouter();

  const retry = (): void => {
    reset();
    void router.invalidate();
  };

  const action = (
    <KkButton variant="outlined" onClick={retry}>
      {BOOT_RETRY_LABEL}
    </KkButton>
  );

  return (
    <KkScreen kind="fullscreen" title={SCREEN_FAILURE_BAR_TITLE} origin={OVERVIEW_ORIGIN}>
      <KkErrorState
        title={SCREEN_FAILURE_TITLE}
        description={SCREEN_FAILURE_DESCRIPTION}
        action={action}
      />
    </KkScreen>
  );
};

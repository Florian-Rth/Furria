import { KkButton } from '@furria/ui';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import { APP_FAILURE_MESSAGE, BOOT_RETRY_LABEL } from '../session-messages';
import { StageFailure } from './StageFailure';

export const AppFailure: FC<ErrorComponentProps> = ({ reset }) => {
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

  return <StageFailure message={APP_FAILURE_MESSAGE} action={action} />;
};

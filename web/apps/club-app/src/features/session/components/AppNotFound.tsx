import { KkButton } from '@furria/ui';
import { useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import { OVERVIEW_PATH } from '../app-sections';
import { APP_NOT_FOUND_MESSAGE, APP_START_LABEL } from '../session-messages';
import { StageFailure } from './StageFailure';

export const AppNotFound: FC = () => {
  const router = useRouter();

  const goToStart = (): void => {
    void router.navigate({ to: OVERVIEW_PATH, replace: true });
  };

  const action = (
    <KkButton variant="outlined" onClick={goToStart}>
      {APP_START_LABEL}
    </KkButton>
  );

  return <StageFailure message={APP_NOT_FOUND_MESSAGE} action={action} />;
};

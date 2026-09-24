import { KkButton, KkErrorState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { OVERVIEW_ORIGIN } from '../app-sections';
import { BOOT_RETRY_LABEL, ME_FAILURE_TITLE, SCREEN_FAILURE_BAR_TITLE } from '../session-messages';

interface MeFailureProps {
  message: string;
  onRetry: () => void;
}

export const MeFailure: FC<MeFailureProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={SCREEN_FAILURE_BAR_TITLE} origin={OVERVIEW_ORIGIN}>
    <KkErrorState
      title={ME_FAILURE_TITLE}
      description={message}
      action={<KkButton onClick={onRetry}>{BOOT_RETRY_LABEL}</KkButton>}
    />
  </KkScreen>
);

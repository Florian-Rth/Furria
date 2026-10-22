import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { START_ORIGIN } from '../app-sections';
import { BOOT_RETRY_LABEL, ME_FAILURE_TITLE, SCREEN_FAILURE_BAR_TITLE } from '../session-messages';

interface MeFailureProps {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}

export const MeFailure: FC<MeFailureProps> = ({ message, retrying, onRetry }) => (
  <KkScreen kind="fullscreen" title={SCREEN_FAILURE_BAR_TITLE} origin={START_ORIGIN}>
    <KkErrorState
      title={ME_FAILURE_TITLE}
      description={message}
      action={
        <KkButton loading={retrying} onClick={onRetry}>
          {BOOT_RETRY_LABEL}
        </KkButton>
      }
    />
  </KkScreen>
);

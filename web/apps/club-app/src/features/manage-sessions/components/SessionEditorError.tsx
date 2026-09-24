import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { SESSIONS_ORIGIN } from '../manage-sessions-labels';
import { ManageSessionsError } from './ManageSessionsError';

interface SessionEditorErrorProps {
  message: string;
  onRetry: () => void;
}

export const SessionEditorError: FC<SessionEditorErrorProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={SESSIONS_ORIGIN.label} origin={SESSIONS_ORIGIN}>
    <ManageSessionsError message={message} onRetry={onRetry} />
  </KkScreen>
);

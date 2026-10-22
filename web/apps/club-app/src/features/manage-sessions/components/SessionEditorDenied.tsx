import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { SESSION_EDITOR_DENIED_MESSAGE, SESSIONS_ORIGIN } from '../manage-sessions-labels';

interface SessionEditorDeniedProps {
  title: string;
}

export const SessionEditorDenied: FC<SessionEditorDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={SESSIONS_ORIGIN}>
    <AccessDenied message={SESSION_EDITOR_DENIED_MESSAGE} />
  </KkScreen>
);

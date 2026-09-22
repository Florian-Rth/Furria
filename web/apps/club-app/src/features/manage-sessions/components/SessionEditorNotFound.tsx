import { KkEmptyState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import {
  SESSION_NOT_FOUND_DESCRIPTION,
  SESSION_NOT_FOUND_TITLE,
  SESSIONS_ORIGIN,
} from '../manage-sessions-labels';

export const SessionEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={SESSIONS_ORIGIN.label} origin={SESSIONS_ORIGIN}>
    <KkEmptyState title={SESSION_NOT_FOUND_TITLE} description={SESSION_NOT_FOUND_DESCRIPTION} />
  </KkScreen>
);

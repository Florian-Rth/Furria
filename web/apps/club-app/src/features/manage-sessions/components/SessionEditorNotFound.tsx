import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
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

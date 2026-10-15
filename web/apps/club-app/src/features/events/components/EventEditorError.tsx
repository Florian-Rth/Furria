import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { EVENTS_ORIGIN } from '@/features/session';
import { EventError } from './EventError';

interface EventEditorErrorProps {
  title: string;
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const EventEditorError: FC<EventEditorErrorProps> = ({
  title,
  message,
  isRetrying,
  onRetry,
}) => (
  <KkScreen kind="fullscreen" title={title} origin={EVENTS_ORIGIN}>
    <EventError message={message} isRetrying={isRetrying} onRetry={onRetry} />
  </KkScreen>
);

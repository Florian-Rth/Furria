import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { EVENTS_ORIGIN } from '@/features/session';
import { EventNotFound } from './EventNotFound';

export const EventEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={EVENTS_ORIGIN.label} origin={EVENTS_ORIGIN}>
    <EventNotFound />
  </KkScreen>
);

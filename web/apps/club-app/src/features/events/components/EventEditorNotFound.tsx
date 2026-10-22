import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { EVENTS_ORIGIN } from '@/features/session/app-sections';
import { EventNotFound } from './EventNotFound';

export const EventEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={EVENTS_ORIGIN.label} origin={EVENTS_ORIGIN}>
    <EventNotFound />
  </KkScreen>
);

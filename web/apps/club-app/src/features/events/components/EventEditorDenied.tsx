import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied, deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const DENIED_MESSAGE = deniedMessageOf(PERMISSION_KEYS.eventsManage);

interface EventEditorDeniedProps {
  title: string;
  origin: KkScreenOrigin;
}

export const EventEditorDenied: FC<EventEditorDeniedProps> = ({ title, origin }) => (
  <KkScreen kind="fullscreen" title={title} origin={origin}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);

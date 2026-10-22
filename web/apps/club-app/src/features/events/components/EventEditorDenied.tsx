import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { deniedMessageOf } from '@/features/session/permission-denials';
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

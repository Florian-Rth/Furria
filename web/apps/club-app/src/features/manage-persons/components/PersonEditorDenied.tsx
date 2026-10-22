import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';

interface PersonEditorDeniedProps {
  title: string;
  origin: KkScreenOrigin;
  message: string;
}

export const PersonEditorDenied: FC<PersonEditorDeniedProps> = ({ title, origin, message }) => (
  <KkScreen kind="fullscreen" title={title} origin={origin}>
    <AccessDenied message={message} />
  </KkScreen>
);

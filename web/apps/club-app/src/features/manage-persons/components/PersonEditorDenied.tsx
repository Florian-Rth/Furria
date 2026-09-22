import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';

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

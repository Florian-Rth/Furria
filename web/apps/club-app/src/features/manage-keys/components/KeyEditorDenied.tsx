import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { KEY_EDITOR_DENIED_MESSAGE } from '../manage-keys-labels';

interface KeyEditorDeniedProps {
  title: string;
  origin: KkScreenOrigin;
}

export const KeyEditorDenied: FC<KeyEditorDeniedProps> = ({ title, origin }) => (
  <KkScreen kind="fullscreen" title={title} origin={origin}>
    <AccessDenied message={KEY_EDITOR_DENIED_MESSAGE} />
  </KkScreen>
);

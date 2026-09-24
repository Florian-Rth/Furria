import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
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

import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { KEYS_ORIGIN, MANAGE_KEYS_TITLE } from '../manage-keys-labels';
import { ManagedKeysError } from './ManagedKeysError';

interface KeyEditorErrorProps {
  message: string;
  onRetry: () => void;
}

export const KeyEditorError: FC<KeyEditorErrorProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={MANAGE_KEYS_TITLE} origin={KEYS_ORIGIN}>
    <ManagedKeysError message={message} onRetry={onRetry} />
  </KkScreen>
);

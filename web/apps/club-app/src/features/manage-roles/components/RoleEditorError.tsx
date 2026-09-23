import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { ROLES_ORIGIN } from '../manage-roles-labels';
import { RolesError } from './RolesError';

const FALLBACK_TITLE = 'Rolle';

interface RoleEditorErrorProps {
  message: string;
  onRetry: () => void;
}

export const RoleEditorError: FC<RoleEditorErrorProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={ROLES_ORIGIN}>
    <RolesError message={message} onRetry={onRetry} />
  </KkScreen>
);

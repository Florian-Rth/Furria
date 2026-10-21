import { KkButton, KkErrorState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { ROLES_ORIGIN } from '../manage-roles-labels';
import { RETRY_LABEL } from '../roles-hub-copy';

const FALLBACK_TITLE = 'Rolle';
const TITLE = 'ROLLE NICHT GELADEN';

interface RoleEditorErrorProps {
  message: string;
  onRetry: () => void;
}

export const RoleEditorError: FC<RoleEditorErrorProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={ROLES_ORIGIN}>
    <KkErrorState
      title={TITLE}
      description={message}
      action={<KkButton onClick={onRetry}>{RETRY_LABEL}</KkButton>}
    />
  </KkScreen>
);

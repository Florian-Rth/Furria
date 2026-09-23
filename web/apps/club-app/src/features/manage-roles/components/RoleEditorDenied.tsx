import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { ROLES_ORIGIN } from '../manage-roles-labels';

const DENIED_MESSAGE = 'Dir fehlt die Berechtigung für Rollen & Rechte.';

interface RoleEditorDeniedProps {
  title: string;
}

export const RoleEditorDenied: FC<RoleEditorDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={ROLES_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);

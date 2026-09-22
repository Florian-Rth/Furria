import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { ROLES_ORIGIN } from '../manage-roles-labels';

const DENIED_MESSAGE = 'Rollen & Rechte ist an eine Rolle gebunden. Du hast sie gerade nicht.';

interface RoleEditorDeniedProps {
  title: string;
}

export const RoleEditorDenied: FC<RoleEditorDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={ROLES_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);

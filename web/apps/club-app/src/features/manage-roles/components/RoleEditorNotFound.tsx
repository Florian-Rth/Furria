import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { ROLES_ORIGIN } from '../manage-roles-labels';
import { RoleNotFound } from './RoleNotFound';

const FALLBACK_TITLE = 'Rolle';

export const RoleEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={ROLES_ORIGIN}>
    <RoleNotFound />
  </KkScreen>
);

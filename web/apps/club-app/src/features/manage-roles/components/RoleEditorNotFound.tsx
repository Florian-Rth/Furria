import { KkEmptyState, KkPanel, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { ROLES_ORIGIN } from '../manage-roles-labels';

const FALLBACK_TITLE = 'Rolle';
const TITLE = 'DIESE ROLLE GIBT ES NICHT';
const DESCRIPTION = 'Sie wurde gelöscht oder der Link ist veraltet.';

export const RoleEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={ROLES_ORIGIN}>
    <KkPanel variant="block">
      <KkEmptyState title={TITLE} description={DESCRIPTION} />
    </KkPanel>
  </KkScreen>
);

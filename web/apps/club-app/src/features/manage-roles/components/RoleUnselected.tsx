import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'KEINE ROLLE GEWÄHLT';
const DESCRIPTION = 'Wähl eine Rolle aus, um ihre Rechte und Inhaberschaften zu sehen.';

export const RoleUnselected: FC = () => (
  <KkPanel variant="block" tone="reserved">
    <KkEmptyState title={TITLE} description={DESCRIPTION} />
  </KkPanel>
);

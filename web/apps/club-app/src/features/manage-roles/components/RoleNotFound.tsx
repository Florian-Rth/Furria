import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'DIESE ROLLE GIBT ES NICHT';
const DESCRIPTION = 'Vielleicht wurde sie umbenannt. Wähl links eine aus.';

export const RoleNotFound: FC = () => (
  <KkPanel variant="block" tone="reserved">
    <KkEmptyState icon="permissions" title={TITLE} description={DESCRIPTION} />
  </KkPanel>
);

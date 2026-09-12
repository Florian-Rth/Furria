import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'DIESE ROLLE GIBT ES NICHT';
const DESCRIPTION = 'Vielleicht wurde sie umbenannt. Wähl eine andere aus der Liste.';

export const RoleNotFound: FC = () => (
  <KkPanel variant="block" tone="cream">
    <KkEmptyState title={TITLE} description={DESCRIPTION} />
  </KkPanel>
);

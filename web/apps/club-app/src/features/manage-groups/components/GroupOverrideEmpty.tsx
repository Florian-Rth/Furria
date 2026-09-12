import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'KEINE GRUPPE GEWÄHLT';
const DESCRIPTION =
  'Wähl eine Gruppe aus der Liste. Die Adresse merkt sich die Auswahl — du kannst den Link jemandem schicken.';

export const GroupOverrideEmpty: FC = () => (
  <KkPanel variant="block" tone="reserved">
    <KkEmptyState title={TITLE} description={DESCRIPTION} />
  </KkPanel>
);

import { KkHubRow, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LAB_ENTRY_META, LAB_PATH, LAB_TITLE } from '../lab-entries';

export const LabEntryRow: FC = () => (
  <KkPanelSection title={LAB_TITLE}>
    <KkPanel>
      <KkHubRow
        label={LAB_TITLE}
        icon="bolt"
        meta={LAB_ENTRY_META}
        component={Link}
        to={LAB_PATH}
      />
    </KkPanel>
  </KkPanelSection>
);

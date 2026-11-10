import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { CLAIM_WINDOW_TITLE } from '../claim-window-copy';
import { useClaimWindowEntry } from '../hooks/use-claim-window-entry';

const SECTION_TITLE = 'Zugang';
const ADMIN_PATH = '/system/claim-window';

export const ClaimWindowSystemSection: FC = () => {
  const entry = useClaimWindowEntry();

  if (!entry.isShown) {
    return null;
  }

  return (
    <KkPanelSection title={SECTION_TITLE}>
      <KkPanel>
        <KkHubRow
          label={CLAIM_WINDOW_TITLE}
          icon="door"
          meta={entry.meta}
          highlight={entry.isOpen}
          component={Link}
          to={ADMIN_PATH}
        />
      </KkPanel>
    </KkPanelSection>
  );
};

import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { SYSTEM_HELP_SPOTS } from '@/features/system/system-help-copy';
import { useWhatsAppEntry } from '../hooks/use-whatsapp-entry';
import { WHATSAPP_SECTION_TITLE, WHATSAPP_TITLE } from '../whatsapp-copy';

const ADMIN_PATH = '/system/whatsapp';

export const WhatsAppSystemSection: FC = () => {
  const entry = useWhatsAppEntry();

  return (
    <KkPanelSection title={WHATSAPP_SECTION_TITLE} landing={SYSTEM_HELP_SPOTS.whatsApp}>
      <KkPanel>
        <KkHubRow
          label={WHATSAPP_TITLE}
          icon="send"
          meta={entry.meta}
          highlight={entry.isConnected}
          component={Link}
          to={ADMIN_PATH}
        />
      </KkPanel>
    </KkPanelSection>
  );
};

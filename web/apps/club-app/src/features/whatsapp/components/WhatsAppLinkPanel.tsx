import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useWhatsAppLink } from '../hooks/use-whatsapp-link';
import { LINK_TITLE } from '../whatsapp-copy';
import { WHATSAPP_HELP_SPOTS } from '../whatsapp-help-copy';
import { WhatsAppPairingForm } from './WhatsAppPairingForm';
import { WhatsAppQrScan } from './WhatsAppQrScan';

export const WhatsAppLinkPanel: FC = () => {
  const link = useWhatsAppLink();

  return (
    <KkPanelSection title={LINK_TITLE} landing={WHATSAPP_HELP_SPOTS.link}>
      <KkPanel>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <WhatsAppQrScan qr={link.qr} />
          <WhatsAppPairingForm link={link} />
        </Stack>
      </KkPanel>
    </KkPanelSection>
  );
};

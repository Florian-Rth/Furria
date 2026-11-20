import { KkPanelStack } from '@furria/ui/KkPanelStack';
import type { FC } from 'react';
import type { WhatsAppOverview } from '../schemas';
import { WhatsAppClubGroupPanel } from './WhatsAppClubGroupPanel';
import { WhatsAppConnectionPanel } from './WhatsAppConnectionPanel';
import { WhatsAppLinkPanel } from './WhatsAppLinkPanel';

interface WhatsAppPanelsProps {
  overview: WhatsAppOverview;
}

export const WhatsAppPanels: FC<WhatsAppPanelsProps> = ({ overview }) => {
  const linkPanel = overview.state === 'scanQrCode' ? <WhatsAppLinkPanel /> : null;
  const clubGroupPanel =
    overview.state === 'working' ? (
      <WhatsAppClubGroupPanel groups={overview.groups} clubChatId={overview.clubChatId} />
    ) : null;

  return (
    <KkPanelStack>
      <WhatsAppConnectionPanel state={overview.state} botPhone={overview.botPhone} />
      {linkPanel}
      {clubGroupPanel}
    </KkPanelStack>
  );
};

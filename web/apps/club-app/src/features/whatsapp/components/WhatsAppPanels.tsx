import { KkPanelStack } from '@furria/ui/KkPanelStack';
import type { FC } from 'react';
import type { WhatsAppOverview } from '../schemas';
import { WhatsAppClubGroupPanel } from './WhatsAppClubGroupPanel';
import { WhatsAppConnectionPanel } from './WhatsAppConnectionPanel';
import { WhatsAppGroupKeepingPanel } from './WhatsAppGroupKeepingPanel';
import { WhatsAppLinkPanel } from './WhatsAppLinkPanel';
import { WhatsAppRefusedAddsPanel } from './WhatsAppRefusedAddsPanel';

interface WhatsAppPanelsProps {
  overview: WhatsAppOverview;
}

export const WhatsAppPanels: FC<WhatsAppPanelsProps> = ({ overview }) => {
  const linkPanel = overview.state === 'scanQrCode' ? <WhatsAppLinkPanel /> : null;
  const clubGroupPanel =
    overview.state === 'working' ? (
      <WhatsAppClubGroupPanel groups={overview.groups} clubChatId={overview.clubChatId} />
    ) : null;
  const hasClubGroup = overview.clubChatId !== null;
  const keepingPanel = hasClubGroup ? (
    <WhatsAppGroupKeepingPanel
      keepsClubGroup={overview.keepsClubGroup}
      inviteLink={overview.clubGroupInviteLink}
    />
  ) : null;
  const refusedPanel = hasClubGroup ? (
    <WhatsAppRefusedAddsPanel refusedAdds={overview.refusedAdds} />
  ) : null;

  return (
    <KkPanelStack>
      <WhatsAppConnectionPanel state={overview.state} botPhone={overview.botPhone} />
      {linkPanel}
      {clubGroupPanel}
      {keepingPanel}
      {refusedPanel}
    </KkPanelStack>
  );
};

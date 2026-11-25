import type { WhatsAppAdminRead } from './use-whatsapp-admin';

export interface WhatsAppHelpViewer {
  showsLink: boolean;
  showsClubGroup: boolean;
  showsKeeping: boolean;
}

export const useWhatsAppHelpViewer = (read: WhatsAppAdminRead): WhatsAppHelpViewer => {
  if (read.kind !== 'shown') {
    return { showsLink: false, showsClubGroup: false, showsKeeping: false };
  }

  return {
    showsLink: read.overview.state === 'scanQrCode',
    showsClubGroup: read.overview.state === 'working',
    showsKeeping: read.overview.clubChatId !== null,
  };
};

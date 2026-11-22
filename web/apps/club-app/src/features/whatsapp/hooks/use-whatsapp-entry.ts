import { useWhatsAppOverviewQuery } from '../api';
import { STATE_COPY } from '../whatsapp-copy';

export interface WhatsAppEntry {
  meta: string | undefined;
  isConnected: boolean;
}

export const useWhatsAppEntry = (): WhatsAppEntry => {
  const state = useWhatsAppOverviewQuery().data?.state;

  return {
    meta: state === undefined ? undefined : STATE_COPY[state].text,
    isConnected: state === 'working',
  };
};

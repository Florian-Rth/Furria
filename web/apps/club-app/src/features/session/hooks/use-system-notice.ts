import type { KkSystemNotice } from '@furria/ui';
import { useIsOnline } from '@/lib/use-is-online';
import { CONNECTION_LOST_DETAIL, CONNECTION_LOST_MESSAGE } from '../session-messages';

const CONNECTION_LOST_NOTICE: KkSystemNotice = {
  id: 'connection-lost',
  tone: 'error',
  icon: 'offline',
  message: CONNECTION_LOST_MESSAGE,
  detail: [CONNECTION_LOST_DETAIL],
};

export const useSystemNotice = (): KkSystemNotice | null => {
  const online = useIsOnline();

  return online ? null : CONNECTION_LOST_NOTICE;
};

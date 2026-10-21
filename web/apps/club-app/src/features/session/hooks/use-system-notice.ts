import type { KkSystemNotice } from '@furria/ui';
import { applyAppUpdate, useAppUpdateReady } from '@/features/app-install';
import { useIsOnline } from '@/lib/use-is-online';
import {
  APP_UPDATE_ACTION,
  APP_UPDATE_DETAIL,
  APP_UPDATE_MESSAGE,
  CONNECTION_LOST_DETAIL,
  CONNECTION_LOST_MESSAGE,
} from '../session-messages';

const CONNECTION_LOST_NOTICE: KkSystemNotice = {
  id: 'connection-lost',
  tone: 'error',
  icon: 'offline',
  message: CONNECTION_LOST_MESSAGE,
  detail: [CONNECTION_LOST_DETAIL],
};

const APP_UPDATE_NOTICE: KkSystemNotice = {
  id: 'app-update',
  tone: 'info',
  icon: 'download',
  message: APP_UPDATE_MESSAGE,
  detail: [APP_UPDATE_DETAIL],
  actions: [{ id: 'reload', label: APP_UPDATE_ACTION, onSelect: applyAppUpdate }],
};

export const useSystemNotice = (): KkSystemNotice | null => {
  const online = useIsOnline();
  const isUpdateReady = useAppUpdateReady();

  if (!online) {
    return CONNECTION_LOST_NOTICE;
  }
  return isUpdateReady ? APP_UPDATE_NOTICE : null;
};

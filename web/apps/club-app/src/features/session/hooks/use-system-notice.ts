import type { KkSystemNotice } from '@furria/ui/KkNotice';
import { applyAppUpdate } from '@/features/app-install/app-update-store';
import { useAppUpdateReady } from '@/features/app-install/hooks/use-app-update-ready';
import { useDownloadNotice } from '@/features/gallery/download/use-download-notice';
import { useIsOnline } from '@/lib/use-is-online';
import {
  APP_UPDATE_ACTION,
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
  actions: [{ id: 'reload', label: APP_UPDATE_ACTION, onSelect: applyAppUpdate }],
};

export const useSystemNotice = (): KkSystemNotice | null => {
  const online = useIsOnline();
  const isUpdateReady = useAppUpdateReady();
  const zipNotice = useDownloadNotice();

  if (!online) {
    return CONNECTION_LOST_NOTICE;
  }
  if (zipNotice !== null) {
    return zipNotice;
  }
  return isUpdateReady ? APP_UPDATE_NOTICE : null;
};

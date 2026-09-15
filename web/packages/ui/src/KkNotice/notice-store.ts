import { createContext, useContext } from 'react';
import type { KkNoticeEntry } from './internal/logic/notice-queue';
import type { KkNoticeLabels, KkNoticeRequest, KkSystemNotice } from './notice-declaration';

export type KkNoticePublisher = (request: KkNoticeRequest) => void;

export interface KkNoticeManager {
  raise: KkNoticePublisher;
  current: KkNoticeEntry | null;
  isOpen: boolean;
  system: KkSystemNotice | null;
  labels: KkNoticeLabels;
  dismiss: () => void;
  finishExit: () => void;
}

export const KkNoticeContext = createContext<KkNoticeManager | null>(null);

export const useKkNoticeManager = (): KkNoticeManager => {
  const manager = useContext(KkNoticeContext);

  if (manager === null) {
    throw new Error('useKkNotice must be used inside KkNoticeProvider.');
  }

  return manager;
};

export const useKkNotice = (): KkNoticePublisher => useKkNoticeManager().raise;

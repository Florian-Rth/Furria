import type { FC, PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { KkNoticeLabels, KkNoticeRequest, KkSystemNotice } from '../../notice-declaration';
import { KkNoticeContext } from '../../notice-store';
import {
  closeNotice,
  currentNotice,
  EMPTY_NOTICE_QUEUE,
  enqueueNotice,
  finishNoticeExit,
  noticeLifetimeMs,
} from './notice-queue';

const ID_PREFIX = 'kk-notice-';

interface KkNoticeProviderProps extends PropsWithChildren {
  labels: KkNoticeLabels;
  systemNotice: KkSystemNotice | null;
}

export const KkNoticeProvider: FC<KkNoticeProviderProps> = ({ labels, systemNotice, children }) => {
  const [queue, setQueue] = useState(EMPTY_NOTICE_QUEUE);
  const lastIdRef = useRef(0);
  const current = currentNotice(queue);
  const lifetime = noticeLifetimeMs(queue);
  const currentId = current === null ? null : current.id;

  const raise = (request: KkNoticeRequest): void => {
    lastIdRef.current += 1;
    const entry = { ...request, id: `${ID_PREFIX}${lastIdRef.current}` };

    setQueue((pending) => enqueueNotice(pending, entry));
  };

  const dismiss = (): void => {
    setQueue(closeNotice);
  };

  const finishExit = (): void => {
    setQueue(finishNoticeExit);
  };

  useEffect(() => {
    if (lifetime === null || currentId === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setQueue(closeNotice);
    }, lifetime);

    return () => {
      window.clearTimeout(timer);
    };
  }, [lifetime, currentId]);

  return (
    <KkNoticeContext.Provider
      value={{
        raise,
        current,
        isOpen: queue.isOpen,
        system: systemNotice,
        labels,
        dismiss,
        finishExit,
      }}
    >
      {children}
    </KkNoticeContext.Provider>
  );
};

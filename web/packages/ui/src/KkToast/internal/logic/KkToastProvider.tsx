import type { FC, PropsWithChildren } from 'react';
import { useRef, useState } from 'react';
import { KkToastViewport } from '../layout/KkToastViewport';
import type { KkToastRequest } from './toast-queue';
import {
  closeToast,
  currentToast,
  EMPTY_TOAST_QUEUE,
  enqueueToast,
  finishToastExit,
} from './toast-queue';
import { KkToastContext } from './toast-store';

export const KkToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [queue, setQueue] = useState(EMPTY_TOAST_QUEUE);
  const lastIdRef = useRef(0);

  const publish = (request: KkToastRequest): void => {
    lastIdRef.current += 1;
    const entry = { ...request, id: `kk-toast-${lastIdRef.current}` };

    setQueue((current) => enqueueToast(current, entry));
  };

  const dismiss = (): void => {
    setQueue(closeToast);
  };

  const finishExit = (): void => {
    setQueue(finishToastExit);
  };

  return (
    <KkToastContext.Provider value={publish}>
      {children}
      <KkToastViewport
        entry={currentToast(queue)}
        isOpen={queue.isOpen}
        onDismiss={dismiss}
        onExited={finishExit}
      />
    </KkToastContext.Provider>
  );
};

import { createContext, useContext } from 'react';
import type { KkToastRequest } from './toast-queue';

export type KkToastPublisher = (request: KkToastRequest) => void;

export const KkToastContext = createContext<KkToastPublisher | null>(null);

export const useKkToast = (): KkToastPublisher => {
  const publish = useContext(KkToastContext);

  if (publish === null) {
    throw new Error('useKkToast must be used inside KkToastProvider.');
  }

  return publish;
};

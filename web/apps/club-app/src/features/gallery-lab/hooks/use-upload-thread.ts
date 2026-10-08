import type { KkScreenThread } from '@furria/ui';
import { useEffect, useState } from 'react';
import { elapsedForSent, sentCountAt } from '../upload-run';

export const UPLOAD_TOTAL = 902;
export const UPLOAD_SENT_AT_OPEN = 418;
const TICK_MS = 400;
const TICK_SECONDS = TICK_MS / 1000;

export const useUploadElapsed = (running: boolean): number => {
  const [elapsed, setElapsed] = useState(() => elapsedForSent(UPLOAD_SENT_AT_OPEN));

  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = window.setInterval(() => {
      setElapsed((current) => current + TICK_SECONDS);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [running]);

  return elapsed;
};

export const useUploadThread = (visible: boolean): KkScreenThread | undefined => {
  const elapsed = useUploadElapsed(visible);
  const sent = sentCountAt(UPLOAD_TOTAL, elapsed);

  return visible
    ? {
        value: sent / UPLOAD_TOTAL,
        tone: 'accent',
        label: `Hochladen: ${sent} von ${UPLOAD_TOTAL}`,
      }
    : undefined;
};

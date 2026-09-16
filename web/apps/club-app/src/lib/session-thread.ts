import type { KkScreenThread, KkScreenThreadTone } from '@furria/ui';
import { sessionAt, sessionProgressAt } from '@/lib/club';

const THREAD_TONE: KkScreenThreadTone = 'neutral';
const THREAD_LABEL = 'Verlauf der Session';

export const toSessionThread = (today: Date): KkScreenThread | undefined => {
  const progress = sessionProgressAt(today);

  if (progress === null) {
    return undefined;
  }

  return {
    value: progress,
    tone: THREAD_TONE,
    label: `${THREAD_LABEL} ${sessionAt(today).yearsLabel}`,
  };
};

import { KK_WELCOME_LEAVE_MS } from '@furria/ui/welcome-paint';
import { useEffect, useState } from 'react';

export type WelcomePhase = 'playing' | 'leaving' | 'over';

export interface WelcomeRunView {
  phase: WelcomePhase;
  leave: () => void;
}

export const useWelcomeRun = (): WelcomeRunView => {
  const [phase, setPhase] = useState<WelcomePhase>('playing');

  useEffect(() => {
    if (phase !== 'leaving') {
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase('over');
    }, KK_WELCOME_LEAVE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase]);

  const leave = (): void => {
    setPhase((current) => (current === 'playing' ? 'leaving' : current));
  };

  return { phase, leave };
};

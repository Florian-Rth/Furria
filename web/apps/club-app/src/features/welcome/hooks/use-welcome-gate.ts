import { KK_WELCOME_SWEEP_MS } from '@furria/ui/KkWelcomeStageSweep';
import { useEffect, useRef, useState } from 'react';
import { useMeQuery } from '@/features/session/api';
import { useWelcomeSeenMutation } from '../api';
import type { WelcomePlan } from '../welcome-plan';
import { owedWelcomeOf, welcomePlanOf } from '../welcome-plan';
import type { WelcomePhase } from './use-welcome-run';
import { useWelcomeRun } from './use-welcome-run';

type WelcomeDecision = { kind: 'pending' } | { kind: 'decided'; plan: WelcomePlan | null };

export interface WelcomeGateView {
  plan: WelcomePlan | null;
  phase: WelcomePhase;
  leave: () => void;
}

export const useWelcomeGate = (): WelcomeGateView => {
  const me = useMeQuery();
  const { mutate: markSeen } = useWelcomeSeenMutation();
  const [decision, setDecision] = useState<WelcomeDecision>({ kind: 'pending' });
  const marked = useRef(false);

  if (decision.kind === 'pending' && me.data !== undefined) {
    const owed = owedWelcomeOf(me.data);

    setDecision({
      kind: 'decided',
      plan: owed === null ? null : welcomePlanOf(owed, KK_WELCOME_SWEEP_MS),
    });
  }

  const plan = decision.kind === 'decided' ? decision.plan : null;
  const run = useWelcomeRun();

  useEffect(() => {
    if (plan === null || marked.current) {
      return;
    }

    marked.current = true;
    markSeen();
  }, [plan, markSeen]);

  return { plan, phase: run.phase, leave: run.leave };
};

import { KK_WELCOME_SWEEP_MS } from '@furria/ui/KkWelcomeStageSweep';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { WelcomeLabCase } from '../welcome-lab';
import type { WelcomePlan } from '../welcome-plan';
import { welcomePlanOf } from '../welcome-plan';
import type { WelcomePhase } from './use-welcome-run';
import { useWelcomeRun } from './use-welcome-run';

const LAB_PATH = '/lab';

export interface WelcomeLabView {
  plan: WelcomePlan;
  phase: WelcomePhase;
  leave: () => void;
}

export const useWelcomeLab = (labCase: WelcomeLabCase): WelcomeLabView => {
  const navigate = useNavigate();
  const plan = welcomePlanOf(labCase.member, KK_WELCOME_SWEEP_MS);
  const run = useWelcomeRun();

  useEffect(() => {
    if (run.phase === 'over') {
      void navigate({ to: LAB_PATH });
    }
  }, [run.phase, navigate]);

  return { plan, phase: run.phase, leave: run.leave };
};

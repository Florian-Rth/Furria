import { createContext, useContext } from 'react';
import type { RunningOrderPlanner } from './hooks/use-running-order-planner';

export const PlannerContext = createContext<RunningOrderPlanner | null>(null);

export const usePlanner = (): RunningOrderPlanner => {
  const planner = useContext(PlannerContext);

  if (planner === null) {
    throw new Error('usePlanner must be used inside the Ablauf list screen.');
  }

  return planner;
};

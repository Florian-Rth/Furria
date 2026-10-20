import { useState } from 'react';
import { toIsoDay } from '@/lib/day';

export interface PlanClock {
  now: Date;
  today: string;
}

export const usePlanClock = (): PlanClock => {
  const [clock] = useState<PlanClock>(() => {
    const now = new Date();

    return { now, today: toIsoDay(now) };
  });

  return clock;
};

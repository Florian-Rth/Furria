import { useState } from 'react';
import type { StartHeadView } from '@/features/start/greeting/head-view';
import { toStartHeadView } from '@/features/start/greeting/head-view';
import { useGreetingAct } from '@/features/start/hooks/use-greeting-act';
import { useGreetingFollows } from '@/features/start/hooks/use-greeting-follows';
import type { LabGreeting } from '../lab-greetings';
import { labMilestoneOf, labShiftOf } from '../lab-greetings';

const NO_FUNCTIONS: readonly [] = [];

export const useLabHead = (greeting: LabGreeting): StartHeadView | null => {
  const [shiftMs] = useState(() => labShiftOf(greeting.at, Date.now()));
  const act = useGreetingAct(greeting.viewer, shiftMs);
  const follows = useGreetingFollows(act?.key ?? null);

  if (act === null) {
    return null;
  }

  return toStartHeadView({
    act,
    firstName: greeting.firstName,
    birthDate: greeting.viewer.birthDate,
    now: new Date(greeting.at),
    reducedMotion: greeting.still,
    follows,
    holder: greeting.holder,
    facts: {
      memberSince: greeting.viewer.memberSince,
      functions: NO_FUNCTIONS,
      milestone: labMilestoneOf(act, greeting.at),
    },
  });
};

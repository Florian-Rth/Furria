import { useState } from 'react';
import type { GreetingView } from '@/features/start';
import { toGreetingView, useGreetingAct, useGreetingFollows } from '@/features/start';
import type { LabGreeting } from '../lab-greetings';
import { labShiftOf } from '../lab-greetings';

export const useLabGreeting = (greeting: LabGreeting): GreetingView | null => {
  const [shiftMs] = useState(() => labShiftOf(greeting.at, Date.now()));
  const act = useGreetingAct(greeting.viewer, shiftMs);
  const follows = useGreetingFollows(act?.key ?? null);

  if (act === null) {
    return null;
  }

  return toGreetingView({
    act,
    firstName: greeting.firstName,
    reducedMotion: greeting.still,
    follows,
  });
};

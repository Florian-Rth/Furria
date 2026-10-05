import { useMeQuery } from '@/features/session';
import { toGreetingViewer } from '../greeting/greeting-act';
import type { GreetingView } from '../greeting/greeting-view';
import { toGreetingView } from '../greeting/greeting-view';
import { useGreetingAct } from './use-greeting-act';
import { useGreetingFollows } from './use-greeting-follows';
import { useReducedMotionPreference } from './use-reduced-motion-preference';

const ON_TIME = 0;

export const useGreeting = (): GreetingView | null => {
  const me = useMeQuery();
  const act = useGreetingAct(me.data === undefined ? null : toGreetingViewer(me.data), ON_TIME);
  const follows = useGreetingFollows(act?.key ?? null);
  const reducedMotion = useReducedMotionPreference();

  if (me.data === undefined || act === null) {
    return null;
  }

  return toGreetingView({ act, firstName: me.data.person.firstName, reducedMotion, follows });
};

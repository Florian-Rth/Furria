import { toImageSource } from '@furria/ui';
import { usePersonalMe } from '@/features/session';
import type { PersonalMe } from '@/lib/api/schemas';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { toGreetingViewer } from '../greeting/greeting-act';
import type { GreetingHolder, GreetingView } from '../greeting/greeting-view';
import { toGreetingView } from '../greeting/greeting-view';
import { useGreetingAct } from './use-greeting-act';
import { useGreetingFollows } from './use-greeting-follows';
import { useReducedMotionPreference } from './use-reduced-motion-preference';

const ON_TIME = 0;

const holderOf = (me: PersonalMe): GreetingHolder => ({
  initials: toInitials(me.person.firstName, me.person.lastName),
  image: toImageSource(me.person.portrait?.picture ?? null, 'portrait'),
  honours: toAvatarHonours(me.honours),
});

export const useGreeting = (): GreetingView | null => {
  const me = usePersonalMe();
  const act = useGreetingAct(me.data === undefined ? null : toGreetingViewer(me.data), ON_TIME);
  const follows = useGreetingFollows(act?.key ?? null);
  const reducedMotion = useReducedMotionPreference();

  if (me.data === undefined || act === null) {
    return null;
  }

  return toGreetingView({
    act,
    firstName: me.data.person.firstName,
    reducedMotion,
    follows,
    holder: holderOf(me.data),
  });
};

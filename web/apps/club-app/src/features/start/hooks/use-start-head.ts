import { toImageSource } from '@furria/ui';
import { usePersonalMe } from '@/features/session';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { useMinuteNow } from '@/lib/use-minute-now';
import { useStartQuery } from '../api';
import { toGreetingViewer } from '../greeting/greeting-act';
import type { StartHeadView } from '../greeting/head-view';
import { toStartHeadView } from '../greeting/head-view';
import { mineOf } from '../start-sheets';
import { useGreetingAct } from './use-greeting-act';
import { useGreetingFollows } from './use-greeting-follows';
import { useReducedMotionPreference } from './use-reduced-motion-preference';

const ON_TIME = 0;
const MILESTONE_KIND = 'milestone';

export const useStartHead = (): StartHeadView | null => {
  const me = usePersonalMe();
  const start = useStartQuery().data;
  const act = useGreetingAct(me.data === undefined ? null : toGreetingViewer(me.data), ON_TIME);
  const follows = useGreetingFollows(act?.key ?? null);
  const reducedMotion = useReducedMotionPreference();
  const now = useMinuteNow();

  if (me.data === undefined || act === null) {
    return null;
  }

  const { person, membership, honours } = me.data;
  const milestone =
    start === undefined
      ? null
      : (mineOf(start).find((mine) => mine.kind === MILESTONE_KIND) ?? null);

  return toStartHeadView({
    act,
    firstName: person.firstName,
    birthDate: person.birthDate,
    now,
    reducedMotion,
    follows,
    holder: {
      initials: toInitials(person.firstName, person.lastName),
      image: toImageSource(person.portrait?.picture ?? null, 'portrait'),
      honours: toAvatarHonours(honours),
    },
    facts: { memberSince: membership.memberSince, functions: honours.functions, milestone },
  });
};

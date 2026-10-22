import { usePersonalMe } from '@/features/session/hooks/use-personal-me';
import { useMinuteNow } from '@/lib/use-minute-now';
import { greetingActAt, toGreetingViewer } from '../greeting/greeting-act';
import type { StartSeason } from '../start-season';
import { startSeasonAt } from '../start-season';

export interface StartLook extends StartSeason {
  foil: boolean;
}

const BIRTHDAY = 'birthday';

export const useStartLook = (): StartLook => {
  const now = useMinuteNow();
  const me = usePersonalMe();
  const foil =
    me.data !== undefined && greetingActAt(now, toGreetingViewer(me.data)).moment === BIRTHDAY;

  return { ...startSeasonAt(now), foil };
};

import { useState } from 'react';
import type { GreetingAct, GreetingViewer } from '../greeting/greeting-act';
import { greetingActAt } from '../greeting/greeting-act';
import { useGreetingClock } from './use-greeting-clock';

export const useGreetingAct = (
  viewer: GreetingViewer | null,
  shiftMs: number,
): GreetingAct | null => {
  const [everySecond, setEverySecond] = useState(false);
  const now = useGreetingClock(everySecond, shiftMs);
  const act = viewer === null ? null : greetingActAt(now, viewer);
  const countingDown = act?.moment === 'openingCountdown';

  if (countingDown !== everySecond) {
    setEverySecond(countingDown);
  }

  return act;
};

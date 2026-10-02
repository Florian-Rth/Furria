import type { KkGreetingPart, KkGreetingPlay } from '@furria/ui';
import { countFlapCells } from '@furria/ui';
import { useState } from 'react';
import { useMeQuery } from '@/features/session';
import { greetingActAt, toGreetingViewer } from '../greeting/greeting-act';
import { toGreetingCopy } from '../greeting/greeting-copy';
import { nextGreetingMemory } from '../greeting/greeting-memory';
import { greetingPlayOf } from '../greeting/greeting-play';
import type { GreetingStage } from '../greeting/greeting-stage';
import { toGreetingStage } from '../greeting/greeting-stage';
import { useGreetingClock } from './use-greeting-clock';
import { useGreetingMemory } from './use-greeting-memory';

export interface GreetingView extends GreetingStage {
  key: string;
  play: KkGreetingPlay;
  festive: boolean;
  night: boolean;
  burst: boolean;
  parts: readonly KkGreetingPart[];
  previousCells: readonly string[] | undefined;
  line: string | null;
  onSettled: (cells: string[], burstFired: boolean) => void;
}

export const useGreeting = (): GreetingView | null => {
  const me = useMeQuery();
  const [everySecond, setEverySecond] = useState(false);
  const now = useGreetingClock(everySecond);
  const act = me.data === undefined ? null : greetingActAt(now, toGreetingViewer(me.data));
  const hold = useGreetingMemory(me.data?.person.id ?? null, act?.key ?? null);
  const countingDown = act?.moment === 'openingCountdown';

  if (countingDown !== everySecond) {
    setEverySecond(countingDown);
  }

  if (me.data === undefined || act === null) {
    return null;
  }

  const copy = toGreetingCopy(act, me.data.person.firstName);
  const decision = greetingPlayOf(act, hold.memory, hold.reducedMotion, countFlapCells(copy.parts));

  const onSettled = (cells: string[], burstFired: boolean): void => {
    hold.remember(nextGreetingMemory(hold.memory, act, cells, burstFired));
  };

  return {
    ...toGreetingStage(act, copy),
    key: act.key,
    play: decision.play,
    festive: act.festive,
    night: act.night,
    burst: decision.burst,
    parts: copy.parts,
    previousCells: hold.memory?.cells,
    line: copy.line,
    onSettled,
  };
};

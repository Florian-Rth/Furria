import { useState } from 'react';
import type { GreetingMemory } from '../greeting/greeting-memory';
import { greetingMemoryKeyOf, parseGreetingMemory } from '../greeting/greeting-memory';

export interface GreetingMemoryHold {
  memory: GreetingMemory | null;
  reducedMotion: boolean;
  remember: (next: GreetingMemory) => void;
}

interface Held {
  personId: number | null;
  actKey: string | null;
  memory: GreetingMemory | null;
  reducedMotion: boolean;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const readMemory = (personId: number | null): GreetingMemory | null => {
  if (personId === null) {
    return null;
  }

  try {
    return parseGreetingMemory(window.localStorage.getItem(greetingMemoryKeyOf(personId)));
  } catch {
    return null;
  }
};

const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
};

const holdFor = (personId: number | null, actKey: string | null): Held => ({
  personId,
  actKey,
  memory: readMemory(personId),
  reducedMotion: prefersReducedMotion(),
});

const writeMemory = (personId: number | null, next: GreetingMemory): void => {
  if (personId === null) {
    return;
  }

  try {
    window.localStorage.setItem(greetingMemoryKeyOf(personId), JSON.stringify(next));
  } catch {
    return;
  }
};

export const useGreetingMemory = (
  personId: number | null,
  actKey: string | null,
): GreetingMemoryHold => {
  const [held, setHeld] = useState<Held>(() => holdFor(personId, actKey));

  if (held.personId !== personId || held.actKey !== actKey) {
    setHeld(holdFor(personId, actKey));
  }

  const remember = (next: GreetingMemory): void => {
    writeMemory(personId, next);
  };

  return { memory: held.memory, reducedMotion: held.reducedMotion, remember };
};

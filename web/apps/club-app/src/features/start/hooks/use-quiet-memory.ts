import { useState } from 'react';
import { toIsoDay } from '@/lib/day';
import type { QuietMemory } from '../start-quiet';
import {
  EMPTY_QUIET_MEMORY,
  parseQuietMemory,
  quietAfterOpen,
  quietMemoryKeyOf,
} from '../start-quiet';

export interface QuietMemoryState {
  memory: QuietMemory;
  quiet: (key: string, until: string) => void;
}

interface Held {
  personId: number | null;
  memory: QuietMemory;
}

const readMemory = (personId: number | null): QuietMemory => {
  if (personId === null) {
    return EMPTY_QUIET_MEMORY;
  }

  try {
    return parseQuietMemory(
      window.localStorage.getItem(quietMemoryKeyOf(personId)),
      toIsoDay(new Date()),
    );
  } catch {
    return EMPTY_QUIET_MEMORY;
  }
};

const writeMemory = (personId: number | null, memory: QuietMemory): void => {
  if (personId === null) {
    return;
  }

  try {
    window.localStorage.setItem(quietMemoryKeyOf(personId), JSON.stringify(memory));
  } catch {
    return;
  }
};

export const useQuietMemory = (personId: number | null): QuietMemoryState => {
  const [held, setHeld] = useState<Held>(() => ({ personId, memory: readMemory(personId) }));

  if (held.personId !== personId) {
    setHeld({ personId, memory: readMemory(personId) });
  }

  const quiet = (key: string, until: string): void => {
    const memory = quietAfterOpen(held.memory, key, until);

    writeMemory(personId, memory);
    setHeld({ personId, memory });
  };

  return { memory: held.memory, quiet };
};

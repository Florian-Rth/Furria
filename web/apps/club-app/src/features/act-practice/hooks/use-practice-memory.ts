import { useEffect, useRef, useState } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { practiceMemoryKeyOf, rememberedStepStartOf } from '../practice-memory';

const readStored = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key: string, stepId: number): void => {
  try {
    window.localStorage.setItem(key, String(stepId));
  } catch {
    return;
  }
};

export const usePracticeMemory = (
  key: { actId: number; personId: number | null },
  playback: StudioPlayback,
  stepId: number | null,
): void => {
  const { player, steps, state } = playback;
  const storageKey = practiceMemoryKeyOf(key.actId, key.personId);
  const restored = useRef(false);
  const [restoredStart] = useState(() => rememberedStepStartOf(steps, readStored(storageKey)));

  useEffect(() => {
    if (restored.current) {
      return;
    }
    restored.current = true;
    if (restoredStart !== null) {
      player.seek(restoredStart);
    }
  }, [player, restoredStart]);

  useEffect(() => {
    if (state.playing && stepId !== null) {
      writeStored(storageKey, stepId);
    }
  }, [storageKey, state.playing, stepId]);
};

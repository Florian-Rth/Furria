import { createContext, useContext } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { StudioBPractice } from './hooks/use-studio-b-practice';

export interface StudioBValue {
  studio: Studio;
  playback: StudioPlayback;
  practice: StudioBPractice;
}

export const StudioBContext = createContext<StudioBValue | null>(null);

export const useStudioB = (): StudioBValue => {
  const value = useContext(StudioBContext);

  if (value === null) {
    throw new Error('useStudioB must be used inside StudioBContext');
  }

  return value;
};

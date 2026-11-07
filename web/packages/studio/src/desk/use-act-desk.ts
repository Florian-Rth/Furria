import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { ActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useState } from 'react';

export type DeskFocus = 'step' | 'part' | 'video' | 'key';

export interface ActDesk {
  screen: StudioWorkScreen;
  editor: ActStudioStage;
  takes: ActStudioTakes;
  focus: DeskFocus;
  partId: number | null;
  keySeconds: number | null;
  focusStep: (stepId: number | null) => void;
  focusPart: (partId: number) => void;
  focusVideo: () => void;
  focusKey: (seconds: number) => void;
  holdKey: (seconds: number) => void;
}

export const useActDesk = (
  screen: StudioWorkScreen,
  editor: ActStudioStage,
  takes: ActStudioTakes,
): ActDesk => {
  const [focus, setFocus] = useState<DeskFocus>('step');
  const [partId, setPartId] = useState<number | null>(null);
  const [keySeconds, setKeySeconds] = useState<number | null>(null);
  const { practice, playback } = screen;

  return {
    screen,
    editor,
    takes,
    focus,
    partId,
    keySeconds,
    focusStep: (stepId) => {
      setFocus('step');
      if (stepId !== null && stepId !== practice.step?.stepId) {
        practice.jumpTo(stepId);
      }
    },
    focusPart: (id) => {
      setFocus('part');
      setPartId(id);
      const first = playback.parts.find((part) => part.partId === id)?.stepIds[0];
      if (first !== undefined && first !== practice.step?.stepId) {
        practice.jumpTo(first);
      }
    },
    focusVideo: () => {
      setFocus('video');
    },
    focusKey: (seconds) => {
      setFocus('key');
      setKeySeconds(seconds);
      playback.player.seek(seconds);
    },
    holdKey: (seconds) => {
      setFocus('key');
      setKeySeconds(seconds);
    },
  };
};

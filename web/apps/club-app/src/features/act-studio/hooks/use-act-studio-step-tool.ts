import { useState } from 'react';
import { markSecondsOf } from '../studio-steps';
import type { StudioScreen } from './use-studio-screen';

export interface ActStudioStepTool {
  deskOpen: boolean;
  canMark: boolean;
  openDesk: () => void;
  closeDesk: () => void;
  markHere: () => void;
}

export const useActStudioStepTool = (screen: StudioScreen): ActStudioStepTool => {
  const { mode, manual, playback, practice } = screen;
  const [deskOpen, setDeskOpen] = useState(false);
  const onSteps = mode.editing && mode.tool === 'steps';
  if (deskOpen && (!onSteps || practice.step === null)) {
    setDeskOpen(false);
  }

  return {
    deskOpen,
    canMark: onSteps && playback.length > 0,
    openDesk: () => {
      setDeskOpen(onSteps);
    },
    closeDesk: () => {
      setDeskOpen(false);
    },
    markHere: () => {
      manual.mark.mutate(markSecondsOf(playback, playback.player.position()));
    },
  };
};

import { useState } from 'react';
import { setupShownOf, setupStartsOpen } from '../studio-setup';
import type { ActStudioStage } from './use-act-studio-stage';
import type { StudioScreen } from './use-studio-screen';
import type { StudioSetup } from './use-studio-setup';
import { useStudioSetup } from './use-studio-setup';

export interface StepCardsSetup {
  setup: StudioSetup;
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export const useStepCardsSetup = (screen: StudioScreen, editor: ActStudioStage): StepCardsSetup => {
  const onEvening = screen.evening !== null;
  const [open, setOpen] = useState(() => setupStartsOpen(screen.studio, onEvening));
  if (open && !setupShownOf(screen.studio, onEvening)) {
    setOpen(false);
  }
  const close = (): void => {
    setOpen(false);
  };
  const setup = useStudioSetup(screen, editor, {
    leave: close,
    showStep: (stepId) => {
      if (stepId !== null) {
        screen.practice.jumpTo(stepId);
      }
    },
    showSpots: editor.openSheet,
  });

  return {
    setup,
    open,
    toggle: () => {
      setOpen((current) => !current);
    },
    close,
  };
};

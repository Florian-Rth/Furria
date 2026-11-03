import { setupShownOf, setupStartsOpen } from '@furria/studio/studio-setup';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useState } from 'react';
import type { StudioScreen } from './use-studio-screen';
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

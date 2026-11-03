import { STUDIO_STEP_GONE } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { markSecondsOf } from '@furria/studio/studio-steps';
import { useSheetTarget } from '@furria/studio/use-sheet-target';

export interface ActStudioStepTool {
  deskOpen: boolean;
  deskStepId: number | null;
  canMark: boolean;
  openDesk: () => void;
  closeDesk: () => void;
  markHere: () => void;
}

export const useActStudioStepTool = (screen: StudioScreen): ActStudioStepTool => {
  const { mode, playback, practice, studio, editor } = screen;
  const onSteps = mode.editing && (mode.tool === 'steps' || editor === 'cards');
  const desk = useSheetTarget(
    studio.steps.map((step) => step.stepId),
    onSteps,
    STUDIO_STEP_GONE,
  );

  return {
    deskOpen: desk.targetId !== null,
    deskStepId: desk.targetId,
    canMark: onSteps && playback.length > 0,
    openDesk: () => {
      if (practice.step !== null) {
        desk.open(practice.step.stepId);
      }
    },
    closeDesk: desk.close,
    markHere: () => {
      screen.document.mark(markSecondsOf(playback, playback.player.position()), playback.length);
    },
  };
};

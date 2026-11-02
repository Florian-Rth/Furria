import { STUDIO_STEP_GONE } from '../studio-copy';
import { markSecondsOf } from '../studio-steps';
import { useDeskTarget } from './use-desk-target';
import type { StudioScreen } from './use-studio-screen';

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
  const desk = useDeskTarget(
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

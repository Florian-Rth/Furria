import type { EditJob } from '@furria/studio/job-model';
import { pickedAfterHoldOf, stageGripOf } from '@furria/studio/job-model';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';

const NOTHING: readonly number[] = [];
const ignore = (): void => undefined;
const grabNothing = (): null => null;

export const jobStageOf = (
  editor: ActStudioStage,
  job: EditJob,
  onPick: (spotId: number) => void,
): ActStudioStage => {
  const grip = stageGripOf(job);

  if (grip === 'watch') {
    return {
      ...editor,
      selected: NOTHING,
      toolbar: false,
      onion: false,
      onionPoints: [],
      tap: ignore,
      hold: ignore,
      grab: grabNothing,
      nudge: ignore,
    };
  }
  if (grip === 'pick') {
    const pick = (spotId: number | null): void => {
      const opens = spotId !== null && pickedAfterHoldOf(editor.selected, spotId) !== null;
      editor.tap(spotId);
      if (opens && spotId !== null) {
        onPick(spotId);
      }
    };

    return {
      ...editor,
      toolbar: false,
      onion: false,
      onionPoints: [],
      tap: pick,
      hold: (spotId) => {
        if (pickedAfterHoldOf(editor.selected, spotId) !== null) {
          pick(spotId);
        }
      },
      grab: grabNothing,
      nudge: ignore,
    };
  }

  return editor;
};

export const hitEditorOf = (editor: ActStudioStage): ActStudioStage => ({
  ...editor,
  selected: NOTHING,
});

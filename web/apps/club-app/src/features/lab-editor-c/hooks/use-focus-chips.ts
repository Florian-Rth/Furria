import type { KkFocusGlyphName } from '@furria/ui/KkFocusGlyph';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import {
  FOCUS_ADD_SPOT,
  FOCUS_ALIGN_ACROSS,
  FOCUS_ALIGN_DEEP,
  FOCUS_BLOCK,
  FOCUS_CIRCLE,
  FOCUS_COPY_PREVIOUS,
  FOCUS_DESELECT,
  FOCUS_DISTRIBUTE,
  FOCUS_LINE,
  FOCUS_MIRROR,
  FOCUS_MULTI,
  selectionNoteOf,
} from '../focus-copy';

export interface FocusChip {
  key: string;
  glyph: KkFocusGlyphName;
  text: string;
  pressed: boolean | undefined;
  disabled: boolean;
  press: () => void;
}

export interface FocusChips {
  note: string;
  chips: FocusChip[];
}

export const useFocusChips = (screen: StudioScreen, stage: ActStudioStage): FocusChips => {
  const { playback, studio } = screen;
  const stepIndex = playback.steps.findIndex(
    (step) => step.stepId === screen.practice.step?.stepId,
  );
  const noSpots = studio.spots.length === 0;
  const chip = (
    key: string,
    glyph: KkFocusGlyphName,
    text: string,
    disabled: boolean,
    press: () => void,
    pressed?: boolean,
  ): FocusChip => ({ key, glyph, text, pressed, disabled, press });

  return {
    note: selectionNoteOf(stage.selected.length, studio.spots.length),
    chips: [
      chip('line', 'line', FOCUS_LINE, noSpots, () => {
        stage.preset('line');
      }),
      chip('circle', 'circle', FOCUS_CIRCLE, noSpots, () => {
        stage.preset('circle');
      }),
      chip('block', 'block', FOCUS_BLOCK, noSpots, () => {
        stage.preset('block');
      }),
      chip('mirror', 'mirror', FOCUS_MIRROR, !stage.canMirror, stage.mirror),
      chip('across', 'alignAcross', FOCUS_ALIGN_ACROSS, !stage.canAlign, () => {
        stage.align('across');
      }),
      chip('deep', 'alignDeep', FOCUS_ALIGN_DEEP, !stage.canAlign, () => {
        stage.align('deep');
      }),
      chip('spread', 'distribute', FOCUS_DISTRIBUTE, !stage.canDistribute, () => {
        stage.distribute('across');
      }),
      chip('copy', 'copy', FOCUS_COPY_PREVIOUS, stepIndex <= 0 || noSpots, stage.copy),
      chip('multi', 'multi', FOCUS_MULTI, noSpots, stage.toggleMulti, stage.multi),
      chip('clear', 'deselect', FOCUS_DESELECT, stage.selected.length === 0, () => {
        for (const spotId of stage.selected) {
          stage.forget(spotId);
        }
      }),
      chip('add', 'addSpot', FOCUS_ADD_SPOT, false, stage.addSpot),
    ],
  };
};

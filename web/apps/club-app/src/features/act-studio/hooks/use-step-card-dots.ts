import type { KkStudioStageDotKind } from '@furria/ui/KkStudioStage';
import { stepDotLabelOf, stepDotNameOf } from '../step-cards-copy';
import { studioDotsAt } from '../studio-dots';
import type { StageShare } from '../studio-edits';
import type { ActStudioStage } from './use-act-studio-stage';
import type { StudioScreen } from './use-studio-screen';

const NUDGE_METRES = 0.5;

export interface StepCardDot {
  key: string;
  x: number;
  y: number;
  number: number;
  name: string;
  kind: KkStudioStageDotKind;
  selected: boolean;
  dimmed: boolean;
  label: string;
  nameAbove: boolean;
  press: (share: StageShare) => void;
  nudge: (right: number, down: number) => void;
}

export const useStepCardDots = (
  screen: StudioScreen,
  editor: ActStudioStage,
  seconds: number,
): StepCardDot[] => {
  const { stage } = screen.playback;
  const names = new Map(
    screen.studio.spots.map((spot) => [spot.spotId, spot.person?.firstName ?? null]),
  );

  return studioDotsAt(editor.scene, seconds, editor.selected, !editor.formation).map((dot) => {
    const name = names.get(dot.spotId) ?? null;

    return {
      key: String(dot.spotId),
      x: dot.x,
      y: dot.y,
      number: dot.number,
      name: stepDotNameOf(name),
      kind: dot.kind,
      selected: dot.selected,
      dimmed: dot.dimmed,
      label: stepDotLabelOf(dot.number, name),
      nameAbove: dot.number % 2 === 1,
      press: (share: StageShare) => {
        editor.press(dot.spotId, share);
      },
      nudge: (right: number, down: number) => {
        editor.press(dot.spotId, { x: dot.x, y: dot.y });
        editor.move({
          x: dot.x + (right * NUDGE_METRES) / stage.widthMetres,
          y: dot.y + (down * NUDGE_METRES) / stage.depthMetres,
        });
        editor.end();
      },
    };
  });
};

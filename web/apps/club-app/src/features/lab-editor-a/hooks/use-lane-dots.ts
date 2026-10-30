import type { KkStudioStageDotKind } from '@furria/ui/KkStudioStage';
import { studioDotsAt } from '@/features/act-studio/studio-dots';
import type { StageShare } from '@/features/act-studio/studio-edits';
import { dotLabelOf, dotNameOf } from '../lane-copy';
import type { LaneEditor } from './use-lane-editor';

const NUDGE_METRES = 0.5;

export interface LaneDot {
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

export const useLaneDots = (lane: LaneEditor, seconds: number): LaneDot[] => {
  const { editor, screen } = lane;
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
      name: dotNameOf(name),
      kind: dot.kind,
      selected: dot.selected,
      dimmed: dot.dimmed,
      label: dotLabelOf(dot.number, name),
      nameAbove: dot.number % 2 === 1,
      press: (share: StageShare) => {
        lane.focusSpots();
        editor.press(dot.spotId, share);
      },
      nudge: (right: number, down: number) => {
        lane.focusSpots();
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

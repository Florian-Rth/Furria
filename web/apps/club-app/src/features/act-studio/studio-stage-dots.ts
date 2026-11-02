import type { StageDotKeys, StageNameSide } from '@furria/studio/Stage';
import type { StageFrame } from '@furria/studio/stage-framing';
import type { KkStageInkDiscKind } from '@furria/ui/KkStageInk';
import type { StageScene } from '@/features/act-practice/practice-stage';
import { stepDotLabelOf, stepDotNameOf } from './step-cards-copy';
import type { SelectionAnchor } from './studio-dots';
import { selectionAnchorOf, studioDotsAt } from './studio-dots';

export interface StudioStageDot {
  key: string;
  x: number;
  y: number;
  number: number;
  kind: KkStageInkDiscKind;
  name: string;
  nameSide: StageNameSide;
  turn: number | null;
  selected: boolean;
  lifted: boolean;
  dimmed: boolean;
  keys: StageDotKeys;
}

export interface StudioStageDots {
  dots: StudioStageDot[];
  anchor: SelectionAnchor | null;
}

export interface StudioStageDotInput {
  scene: StageScene;
  seconds: number;
  selected: readonly number[];
  dimOthers: boolean;
  lifted: ReadonlySet<number>;
  frame: StageFrame;
  choose: (spotId: number) => void;
  nudge: (spotId: number, right: number, down: number) => void;
}

const nameSideOf = (number: number): StageNameSide => (number % 2 === 1 ? 'above' : 'below');

export const studioStageDotsOf = ({
  scene,
  seconds,
  selected,
  dimOthers,
  lifted,
  frame,
  choose,
  nudge,
}: StudioStageDotInput): StudioStageDots => {
  const names = new Map(scene.spots.map((spot) => [spot.spotId, spot.person?.firstName ?? null]));
  const shown = studioDotsAt(scene, seconds, selected, dimOthers);

  return {
    dots: shown.map((dot) => {
      const name = names.get(dot.spotId) ?? null;

      return {
        key: String(dot.spotId),
        x: dot.x,
        y: dot.y,
        number: dot.number,
        kind: dot.kind,
        name: stepDotNameOf(name),
        nameSide: nameSideOf(dot.number),
        turn: dot.turn,
        selected: dot.selected,
        lifted: lifted.has(dot.spotId),
        dimmed: dot.dimmed,
        keys: {
          label: stepDotLabelOf(dot.number, name),
          onChoose: () => {
            choose(dot.spotId);
          },
          onNudge: (right, down) => {
            nudge(dot.spotId, right, down);
          },
        },
      };
    }),
    anchor: selectionAnchorOf(shown, frame),
  };
};

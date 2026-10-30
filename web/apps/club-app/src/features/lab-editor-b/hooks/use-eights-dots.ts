import type { KkEightsDotKind, KkEightsTagSide } from '@furria/ui/KkEightsDot';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { StageScene } from '@/features/act-practice/practice-stage';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { studioDotsAt } from '@/features/act-studio/studio-dots';
import type { StageShare } from '@/features/act-studio/studio-edits';

export interface EightsDot {
  key: string;
  x: number;
  y: number;
  number: number;
  name: string | null;
  tagSide: KkEightsTagSide;
  kind: KkEightsDotKind;
  selected: boolean;
  dimmed: boolean;
  label: string;
  press: (share: StageShare) => void;
}

const FRONT_EDGE = 0.18;

const tagSideOf = (number: number, y: number): KkEightsTagSide => {
  if (number % 2 === 1) {
    return 'below';
  }

  return y < FRONT_EDGE ? 'under' : 'above';
};

const dotsOf = (
  scene: StageScene,
  seconds: number,
  selected: readonly number[],
  dimOthers: boolean,
  press: (spotId: number, share: StageShare) => void,
): EightsDot[] => {
  const names = new Map(scene.spots.map((spot) => [spot.spotId, spot.person?.firstName ?? null]));

  return studioDotsAt(scene, seconds, selected, dimOthers).map((dot) => ({
    key: String(dot.spotId),
    x: dot.x,
    y: dot.y,
    number: dot.number,
    name: names.get(dot.spotId) ?? null,
    tagSide: tagSideOf(dot.number, dot.y),
    kind: dot.kind,
    selected: dot.selected,
    dimmed: dot.dimmed,
    label: dot.label,
    press: (share) => {
      press(dot.spotId, share);
    },
  }));
};

const NONE: readonly number[] = [];

export const useEightsLiveDots = (screen: StudioScreen, editor: ActStudioStage): EightsDot[] => {
  const seconds = usePlaybackSeconds(screen.playback.player);

  return dotsOf(editor.scene, seconds, editor.selected, !editor.formation, editor.press);
};

export const useEightsStillDots = (scene: StageScene, seconds: number): EightsDot[] =>
  dotsOf(scene, seconds, NONE, false, () => undefined);

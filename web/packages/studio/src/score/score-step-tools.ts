import type { MixPlayer } from '@furria/studio/mix-player';
import type { LiveScene } from '@furria/studio/score-live';

export interface ScoreStepTools {
  scene: LiveScene;
  player: MixPlayer;
  practiseFrom: ((stepId: number) => void) | null;
  editFrom: ((stepId: number) => void) | null;
}

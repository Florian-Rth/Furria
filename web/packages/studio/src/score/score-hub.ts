import type { ScoreModel } from '@furria/studio/score-model';
import type { ScoreStep } from '@furria/studio/score-steps';
import type { ScoreGroupView, ScoreStepView, ScoreYouView } from '@furria/studio/score-views';
import type { Studio } from '@furria/studio/studio-schemas';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import type { KkGroupTone } from '@furria/ui/group-tone';

export interface ScoreHub {
  wide: boolean;
  reveal: boolean;
  tone: KkGroupTone | null;
  canEditStudio: boolean;
  canPlay: boolean;
  studio: Studio;
  model: ScoreModel;
  player: ScorePlayer;
  parts: TimelinePart[];
  steps: TimelineStep[];
  groups: ScoreGroupView[];
  you: ScoreYouView | null;
  paneStepId: number | null;
  drawerStep: ScoreStepView | null;
  nowStep: ScoreStep | null;
  selectRow: (stepId: number) => void;
  selectPart: (partId: number) => void;
  practise: () => void;
  practiseFrom: (stepId: number) => void;
  editFrom: (stepId: number) => void;
  closeStep: () => void;
}

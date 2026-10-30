import { useKkFocusDesk } from '@furria/ui/use-focus-desk';
import { useState } from 'react';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import { useActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type { ActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import { useActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import type {
  StudioEveningContext,
  StudioScreen,
} from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import type { VisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { countStepOf } from '../focus-counts';
import type { FocusKey } from '../focus-keys';
import type { FocusMusicTool } from '../schemas';
import type { FocusChips } from './use-focus-chips';
import { useFocusChips } from './use-focus-chips';
import { useFocusKeys } from './use-focus-keys';
import type { FocusLanes } from './use-focus-lanes';
import { useFocusLanes } from './use-focus-lanes';
import type { FocusOutline } from './use-focus-outline';
import { useFocusOutline } from './use-focus-outline';
import type { FocusSetup } from './use-focus-setup';
import { useFocusSetup } from './use-focus-setup';
import type { FocusView } from './use-focus-view';
import { useFocusView } from './use-focus-view';

export type FocusStageTool = 'formation' | 'movement';

export interface FocusHistory extends VisitHistory {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export interface FocusEditor {
  desk: boolean;
  screen: StudioScreen;
  stage: ActStudioStage;
  takes: ActStudioTakes;
  view: FocusView;
  lanes: FocusLanes;
  outline: FocusOutline;
  chips: FocusChips;
  setup: FocusSetup;
  history: FocusHistory;
  tool: FocusStageTool;
  glide: boolean;
  stepNumber: number;
  chooseTool: (tool: FocusStageTool) => void;
  skip: (direction: -1 | 1) => void;
  jumpToIndex: (index: number) => void;
  seek: (seconds: number) => void;
  calm: () => void;
}

export interface FocusEditorInput {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  context: StudioEveningContext;
  openMusic: (tool: FocusMusicTool) => void;
}

export const useFocusEditor = ({
  actId,
  studio,
  viewerId,
  canEdit,
  cast,
  context,
  openMusic,
}: FocusEditorInput): FocusEditor => {
  const desk = useKkFocusDesk();
  const screen = useStudioScreen(actId, studio, viewerId, canEdit, cast, context);
  const { mode, playback, practice } = screen;
  if (mode.tool !== 'formation' && mode.tool !== 'movement') {
    mode.choose('formation');
  }
  const stage = useActStudioStage(screen);
  const takes = useActStudioTakes(screen);
  const view = useFocusView(screen);
  const lanes = useFocusLanes(screen, stage, takes, view.view, view.reveal);
  const outline = useFocusOutline(screen, view.reveal);
  const chips = useFocusChips(screen, stage);
  const setup = useFocusSetup(screen, stage, openMusic);
  const visit = useVisitHistory(actId, screen.studio);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [glide, setGlide] = useState(false);
  const stepIndex = playback.steps.findIndex((step) => step.stepId === practice.step?.stepId);

  const skip = (direction: -1 | 1): void => {
    setGlide(true);
    practice.skip(direction < 0 ? 'back' : 'forward');
    view.reveal();
  };
  const seek = (seconds: number): void => {
    playback.player.seek(seconds);
    view.reveal();
  };
  const countStep = (direction: -1 | 1): void => {
    const target = countStepOf(playback.countMarks, playback.player.position(), direction);
    if (target !== null) {
      seek(target);
    }
  };
  const runs: Record<FocusKey, () => void> = {
    toggle: playback.controls.toggle,
    previousStep: () => {
      skip(-1);
    },
    nextStep: () => {
      skip(1);
    },
    previousCount: () => {
      countStep(-1);
    },
    nextCount: () => {
      countStep(1);
    },
    zoomIn: view.zoomIn,
    zoomOut: view.zoomOut,
  };

  useFocusKeys({
    run: (key) => {
      runs[key]();
    },
    undo: visit.undo,
    redo: visit.redo,
    canUndo: visit.canUndo,
    canRedo: visit.canRedo,
  });

  return {
    desk,
    screen,
    stage,
    takes,
    view,
    lanes,
    outline,
    chips,
    setup,
    history: {
      ...visit,
      open: historyOpen,
      show: () => {
        setHistoryOpen(true);
      },
      hide: () => {
        setHistoryOpen(false);
      },
    },
    tool: mode.tool === 'movement' ? 'movement' : 'formation',
    glide: glide && !playback.state.playing,
    stepNumber: stepIndex + 1,
    chooseTool: mode.choose,
    skip,
    jumpToIndex: (index) => {
      const target = playback.steps[index];
      if (target !== undefined && target.stepId !== practice.step?.stepId) {
        setGlide(true);
        practice.jumpTo(target.stepId);
      }
    },
    seek,
    calm: () => {
      setGlide(false);
    },
  };
};

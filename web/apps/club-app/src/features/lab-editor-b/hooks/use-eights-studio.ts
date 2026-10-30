import { useState } from 'react';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import { useActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import { useStudioHistory } from '@/features/act-studio/hooks/use-studio-history';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioUndo } from '@/features/act-studio/hooks/use-studio-undo';
import type { Studio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { SheetDensity } from '../count-sheet';
import { zoomedOf } from '../count-sheet';
import type { SetupProgress } from '../setup-progress';
import { setupProgressOf } from '../setup-progress';

export interface EightsHistory {
  canUndo: boolean;
  canRedo: boolean;
  count: number;
  undo: () => void;
  redo: () => void;
}

export interface EightsStudio {
  screen: StudioScreen;
  editor: ActStudioStage;
  history: EightsHistory;
  progress: SetupProgress;
  density: SheetDensity;
  setDensity: (density: SheetDensity) => void;
  zoom: (direction: -1 | 1) => void;
}

export interface EightsStudioInput {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  evening: StudioEvening | null;
  zoom: SheetDensity | undefined;
}

export const useEightsStudio = ({
  actId,
  studio,
  viewerId,
  canEdit,
  cast,
  evening,
  zoom,
}: EightsStudioInput): EightsStudio => {
  const screen = useStudioScreen(actId, studio, viewerId, canEdit, cast, {
    evening,
    startEditing: true,
  });
  const editor = useActStudioStage(screen);
  const { history, canUndo, canRedo } = useStudioHistory(actId);
  const { undo, redo } = useStudioUndo(actId);
  const [density, setDensity] = useState<SheetDensity>(zoom ?? 'eight');
  const { mode } = screen;

  if (mode.tool !== 'formation' && mode.tool !== 'movement') {
    mode.choose('formation');
  }

  return {
    screen,
    editor,
    history: { canUndo, canRedo, count: history.entries.length, undo, redo },
    progress: setupProgressOf(studio),
    density,
    setDensity,
    zoom: (direction) => {
      setDensity((current) => zoomedOf(current, direction));
    },
  };
};

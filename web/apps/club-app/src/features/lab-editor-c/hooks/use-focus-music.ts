import type { ActStudioFinal } from '@/features/act-studio/hooks/use-act-studio-final';
import { useActStudioFinal } from '@/features/act-studio/hooks/use-act-studio-final';
import type { ActStudioSongs } from '@/features/act-studio/hooks/use-act-studio-songs';
import { useActStudioSongs } from '@/features/act-studio/hooks/use-act-studio-songs';
import type { ActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import { useActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import type { VisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { FocusMusicTool } from '../schemas';
import { useFocusKeys } from './use-focus-keys';

export interface FocusMusic {
  screen: StudioScreen;
  songs: ActStudioSongs;
  finalList: ActStudioFinal;
  takes: ActStudioTakes;
  history: VisitHistory;
  showMusic: () => void;
  showVideo: () => void;
}

export interface FocusMusicInput {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  cast: readonly CastPerson[];
  canEdit: boolean;
  tool: FocusMusicTool;
  choose: (tool: FocusMusicTool) => void;
}

const SESSION = { evening: null, startEditing: true };

export const useFocusMusic = ({
  actId,
  studio,
  viewerId,
  cast,
  canEdit,
  tool,
  choose,
}: FocusMusicInput): FocusMusic => {
  const screen = useStudioScreen(actId, studio, viewerId, canEdit, cast, SESSION);
  if (screen.mode.tool !== tool) {
    screen.mode.choose(tool);
  }
  const songs = useActStudioSongs(screen);
  const finalList = useActStudioFinal(screen);
  const takes = useActStudioTakes(screen);
  const history = useVisitHistory(actId, screen.studio);

  useFocusKeys({
    run: (key) => {
      if (key === 'toggle') {
        screen.playback.controls.toggle();
      }
    },
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  });

  return {
    screen,
    songs,
    finalList,
    takes,
    history,
    showMusic: () => {
      choose('music');
    },
    showVideo: () => {
      choose('video');
    },
  };
};

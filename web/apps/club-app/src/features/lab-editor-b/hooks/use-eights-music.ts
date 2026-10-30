import { useState } from 'react';
import type { ActStudioFinal } from '@/features/act-studio/hooks/use-act-studio-final';
import { useActStudioFinal } from '@/features/act-studio/hooks/use-act-studio-final';
import type { ActStudioSongs } from '@/features/act-studio/hooks/use-act-studio-songs';
import { useActStudioSongs } from '@/features/act-studio/hooks/use-act-studio-songs';
import type { ActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import { useActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import { useStudioHistory } from '@/features/act-studio/hooks/use-studio-history';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioUndo } from '@/features/act-studio/hooks/use-studio-undo';
import type { Studio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { EightsMusicTab } from './use-eights-routes';
import type { EightsHistory } from './use-eights-studio';

export interface EightsMusic {
  screen: StudioScreen;
  songs: ActStudioSongs;
  finalList: ActStudioFinal;
  takes: ActStudioTakes;
  tab: EightsMusicTab;
  history: EightsHistory;
  showMusic: () => void;
  showVideo: () => void;
}

export interface EightsMusicInput {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  evening: StudioEvening | null;
  tab: EightsMusicTab | undefined;
}

export const useEightsMusic = ({
  actId,
  studio,
  viewerId,
  canEdit,
  cast,
  evening,
  tab: initial,
}: EightsMusicInput): EightsMusic => {
  const screen = useStudioScreen(actId, studio, viewerId, canEdit, cast, {
    evening,
    startEditing: true,
    startHall: null,
  });
  const songs = useActStudioSongs(screen);
  const finalList = useActStudioFinal(screen);
  const takes = useActStudioTakes(screen);
  const { history, canUndo, canRedo } = useStudioHistory(actId);
  const { undo, redo } = useStudioUndo(actId);
  const [tab, setTab] = useState<EightsMusicTab>(initial ?? 'music');
  const wanted = tab === 'music' ? 'music' : 'video';

  if (screen.mode.tools.includes(wanted) && screen.mode.tool !== wanted) {
    screen.mode.choose(wanted);
  }

  return {
    screen,
    songs,
    finalList,
    takes,
    tab,
    history: { canUndo, canRedo, count: history.entries.length, undo, redo },
    showMusic: () => {
      setTab('music');
    },
    showVideo: () => {
      setTab('video');
    },
  };
};

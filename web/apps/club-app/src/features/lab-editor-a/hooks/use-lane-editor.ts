import { useState } from 'react';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import { useActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type { ActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import { useActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import type { Studio, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { Setup } from '../lane-setup';
import { setupOf } from '../lane-setup';

export type LaneFocus = 'step' | 'part' | 'video' | 'spot' | 'key';
export type LaneTab = 'selection' | 'history' | 'setup';
export type LaneStageTool = 'formation' | 'movement';

export interface LaneSource {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  evening: StudioEvening | null;
}

export interface LaneEditor {
  screen: StudioScreen;
  editor: ActStudioStage;
  takes: ActStudioTakes;
  setup: Setup;
  focus: LaneFocus;
  partId: number | null;
  videoId: number | null;
  keySeconds: number | null;
  tab: LaneTab;
  setupShown: boolean;
  stageTool: LaneStageTool;
  chooseTab: (tab: LaneTab) => void;
  toggleSetup: () => void;
  closeSetup: () => void;
  focusStep: (stepId: number | null) => void;
  focusPart: (partId: number) => void;
  focusVideo: (videoId: number) => void;
  focusKey: (seconds: number) => void;
  focusSpots: () => void;
  chooseStageTool: (tool: LaneStageTool) => void;
}

const isStageTool = (tool: string): tool is LaneStageTool =>
  tool === 'formation' || tool === 'movement';

export const useLaneEditor = (source: LaneSource): LaneEditor => {
  const screen = useStudioScreen(
    source.actId,
    source.studio,
    source.viewerId,
    source.canEdit,
    source.cast,
    { evening: source.evening, startEditing: true, startHall: null },
  );
  if (!isStageTool(screen.mode.tool)) {
    screen.mode.choose('formation');
  }
  const editor = useActStudioStage(screen);
  const takes = useActStudioTakes(screen);
  const setup = setupOf(screen.studio);
  const [focus, setFocus] = useState<LaneFocus>('step');
  const [partId, setPartId] = useState<number | null>(null);
  const [videoId, setVideoId] = useState<number | null>(null);
  const [keySeconds, setKeySeconds] = useState<number | null>(null);
  const [tab, setTab] = useState<LaneTab>(setup.started ? 'selection' : 'setup');
  const { practice, playback } = screen;
  const shownFocus = focus === 'spot' && editor.selected.length === 0 ? 'step' : focus;

  return {
    screen,
    editor,
    takes,
    setup,
    focus: shownFocus,
    partId,
    videoId,
    keySeconds,
    tab,
    setupShown: tab === 'setup',
    stageTool: isStageTool(screen.mode.tool) ? screen.mode.tool : 'formation',
    chooseTab: setTab,
    toggleSetup: () => {
      setTab((current) => (current === 'setup' ? 'selection' : 'setup'));
    },
    closeSetup: () => {
      setTab('selection');
    },
    focusStep: (stepId) => {
      setFocus('step');
      setTab('selection');
      if (stepId !== null && stepId !== practice.step?.stepId) {
        practice.jumpTo(stepId);
      }
    },
    focusPart: (id) => {
      setFocus('part');
      setPartId(id);
      setTab('selection');
      const first = playback.parts.find((part) => part.partId === id)?.stepIds[0];
      if (first !== undefined && first !== practice.step?.stepId) {
        practice.jumpTo(first);
      }
    },
    focusVideo: (id) => {
      setFocus('video');
      setVideoId(id);
      setTab('selection');
    },
    focusKey: (seconds) => {
      setFocus('key');
      setKeySeconds(seconds);
      setTab('selection');
      playback.player.seek(seconds);
    },
    focusSpots: () => {
      setFocus('spot');
      setTab('selection');
    },
    chooseStageTool: (tool) => {
      screen.mode.choose(tool);
    },
  };
};

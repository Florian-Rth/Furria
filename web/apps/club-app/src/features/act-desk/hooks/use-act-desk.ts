import { useState } from 'react';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type { ActStudioTakes } from '@/features/act-studio/hooks/use-act-studio-takes';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';

export type DeskFocus = 'step' | 'part' | 'video' | 'spot' | 'key';
export type DeskTab = 'selection' | 'history';
export type DeskStageTool = 'formation' | 'movement';

export interface ActDesk {
  screen: StudioScreen;
  editor: ActStudioStage;
  takes: ActStudioTakes;
  focus: DeskFocus;
  partId: number | null;
  keySeconds: number | null;
  tab: DeskTab;
  stageTool: DeskStageTool;
  chooseTab: (tab: DeskTab) => void;
  focusStep: (stepId: number | null) => void;
  focusPart: (partId: number) => void;
  focusVideo: () => void;
  focusKey: (seconds: number) => void;
  holdKey: (seconds: number) => void;
  focusSpots: () => void;
  chooseStageTool: (tool: DeskStageTool) => void;
}

export const useActDesk = (
  screen: StudioScreen,
  editor: ActStudioStage,
  takes: ActStudioTakes,
): ActDesk => {
  const [focus, setFocus] = useState<DeskFocus>('step');
  const [partId, setPartId] = useState<number | null>(null);
  const [keySeconds, setKeySeconds] = useState<number | null>(null);
  const [tab, setTab] = useState<DeskTab>('selection');
  const { practice, playback, mode } = screen;
  const shownFocus = focus === 'spot' && editor.selected.length === 0 ? 'step' : focus;

  return {
    screen,
    editor,
    takes,
    focus: shownFocus,
    partId,
    keySeconds,
    tab,
    stageTool: mode.tool === 'movement' ? 'movement' : 'formation',
    chooseTab: setTab,
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
    focusVideo: () => {
      setFocus('video');
      setTab('selection');
    },
    focusKey: (seconds) => {
      setFocus('key');
      setKeySeconds(seconds);
      setTab('selection');
      playback.player.seek(seconds);
    },
    holdKey: (seconds) => {
      setFocus('key');
      setKeySeconds(seconds);
    },
    focusSpots: () => {
      setFocus('spot');
      setTab('selection');
    },
    chooseStageTool: (tool) => {
      mode.choose(tool);
    },
  };
};

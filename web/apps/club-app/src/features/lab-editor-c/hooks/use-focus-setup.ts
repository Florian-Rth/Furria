import { useState } from 'react';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type { ActUploads } from '@/features/act-studio/hooks/use-act-uploads';
import { useActUploads } from '@/features/act-studio/hooks/use-act-uploads';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { markSecondsOf } from '@/features/act-studio/studio-steps';
import {
  SETUP_HINT,
  SETUP_TEXT,
  setupChipLabelOf,
  setupChipOf,
  uploadingTextOf,
} from '../focus-copy';
import type { SetupProgress, SetupState, SetupTask } from '../focus-setup';
import { setupProgressOf, setupSourceOf, setupStateOf } from '../focus-setup';
import type { FocusMusicTool } from '../schemas';

export interface FocusSetupAction {
  task: SetupTask;
  number: number;
  text: string;
  hint: string;
  state: SetupState;
  run: () => void;
}

export interface FocusSetup {
  progress: SetupProgress;
  chip: string;
  chipLabel: string;
  open: boolean;
  uploads: ActUploads;
  uploading: string | null;
  actions: FocusSetupAction[];
  actionOf: (task: SetupTask) => FocusSetupAction | null;
  show: () => void;
  hide: () => void;
}

export const useFocusSetup = (
  screen: StudioScreen,
  stage: ActStudioStage,
  openMusic: (tool: FocusMusicTool) => void,
): FocusSetup => {
  const { playback, manual, studio, mode } = screen;
  const progress = setupProgressOf(setupSourceOf(studio));
  const uploads = useActUploads(screen.actId, screen.music.add.mutateAsync);
  const [open, setOpen] = useState(false);
  const firstUpload = uploads.rows[0];

  const runs: Record<SetupTask, () => void> = {
    music: uploads.choose,
    steps: () => {
      playback.player.seek(0);
      if (playback.length > 0) {
        manual.mark.mutate(markSecondsOf(playback, 0));
      }
    },
    spots: stage.addSpot,
    formation: () => {
      mode.choose('formation');
      playback.player.seek(playback.steps[0]?.startSeconds ?? 0);
      stage.preset('line');
    },
    video: () => {
      openMusic('video');
    },
    final: () => {
      openMusic('music');
    },
  };
  const actions = progress.items.map((item) => ({
    task: item.task,
    number: item.number,
    text: SETUP_TEXT[item.task],
    hint: SETUP_HINT[item.task],
    state: item.state,
    run: () => {
      setOpen(false);
      runs[item.task]();
    },
  }));

  return {
    progress,
    chip: setupChipOf(progress.done, progress.total),
    chipLabel: setupChipLabelOf(progress.done, progress.total),
    open,
    uploads,
    uploading: firstUpload === undefined ? null : uploadingTextOf(firstUpload.share),
    actions,
    actionOf: (task) =>
      setupStateOf(progress, task) === 'done'
        ? null
        : (actions.find((action) => action.task === task) ?? null),
    show: () => {
      setOpen(true);
    },
    hide: () => {
      setOpen(false);
    },
  };
};

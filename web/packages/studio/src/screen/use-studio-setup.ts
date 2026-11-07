import {
  SETUP_ACTIONS,
  SETUP_HINTS,
  SETUP_OPTIONAL,
  SETUP_STATES,
  SETUP_STEPS_DONE_ACTION,
  SETUP_TITLES,
  setupFactOf,
  setupProgressLabelOf,
  setupProgressTextOf,
  uploadFactOf,
} from '@furria/studio/setup-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { SetupKey, SetupRow } from '@furria/studio/studio-setup';
import { setupOf, setupShownOf } from '@furria/studio/studio-setup';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import { markSecondsOf } from '@furria/studio/studio-steps';
import type { StudioUploads } from '@furria/studio/studio-uploads';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useStudioUploads } from '@furria/studio/use-studio-uploads';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';

const GLYPHS: Record<SetupKey, KkLaneGlyphName> = {
  music: 'music',
  steps: 'steps',
  spots: 'spots',
  formation: 'formation',
  video: 'video',
  final: 'final',
};

export interface StudioSetupHost {
  leave: () => void;
  showStep: (stepId: number | null) => void;
  showSpots: () => void;
}

const stateTextOf = (row: SetupRow): string =>
  row.optional && row.state !== 'done' ? SETUP_OPTIONAL : SETUP_STATES[row.state];

const uploadingOf = (uploads: StudioUploads): string | null => {
  const first = uploads.rows[0];

  return first === undefined ? null : uploadFactOf(first.name, first.share);
};

export const useStudioSetup = (
  screen: StudioScreen,
  editor: ActStudioStage,
  host: StudioSetupHost,
): StudioSetup => {
  const { playback, mode, studio } = screen;
  const setup = setupOf(studio);
  const shown = setupShownOf(studio, screen.evening !== null);
  const stepsDone = setup.rows.some((row) => row.key === 'steps' && row.state === 'done');
  const songs = useStudioUploads(screen.uploads.songs);
  const videos = useStudioUploads(screen.uploads.videos);
  const actions: Record<SetupKey, () => void> = {
    music: songs.choose,
    steps: () => {
      host.leave();
      if (stepsDone) {
        host.showStep(playback.steps[0]?.stepId ?? null);
        return;
      }
      playback.player.seek(0);
      screen.document.mark(markSecondsOf(playback, 0), playback.length);
      host.showStep(null);
    },
    spots: () => {
      host.leave();
      mode.choose('formation');
      editor.addSpot();
      host.showSpots();
    },
    formation: () => {
      host.leave();
      mode.choose('formation');
      host.showStep(playback.steps[0]?.stepId ?? null);
    },
    video: videos.choose,
    final: () => {
      screen.openMusic('music');
    },
  };
  const uploading: Partial<Record<SetupKey, string | null>> = {
    music: uploadingOf(songs),
    video: uploadingOf(videos),
  };
  const rows = setup.rows.map((row) => ({
    key: row.key,
    number: row.number,
    total: setup.rows.length,
    state: row.state,
    ready: row.ready,
    stateText: stateTextOf(row),
    glyph: GLYPHS[row.key],
    title: SETUP_TITLES[row.key],
    hint: SETUP_HINTS[row.key],
    fact: uploading[row.key] ?? setupFactOf(row),
    actionText: row.key === 'steps' && stepsDone ? SETUP_STEPS_DONE_ACTION : SETUP_ACTIONS[row.key],
    act: actions[row.key],
  }));

  return {
    setup,
    shown,
    rows,
    progressText: setupProgressTextOf(setup.done, setup.total),
    progressLabel: setupProgressLabelOf(setup.done, setup.total),
    songs,
    videos,
    rowOf: (key) => {
      const row = rows.find((candidate) => candidate.key === key) ?? null;

      return !shown || row === null || row.state === 'done' ? null : row;
    },
  };
};

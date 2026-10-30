import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';
import {
  SETUP_ACTIONS,
  SETUP_HINTS,
  SETUP_STATES,
  SETUP_STEPS_DONE_ACTION,
  SETUP_TITLES,
  setupFactOf,
  setupProgressLabelOf,
  setupProgressTextOf,
  uploadFactOf,
} from '../setup-copy';
import type { Setup, SetupKey, SetupState } from '../studio-setup';
import { setupOf, setupShownOf } from '../studio-setup';
import { markSecondsOf } from '../studio-steps';
import type { ActStudioStage } from './use-act-studio-stage';
import type { ActUploads } from './use-act-uploads';
import { useActUploads } from './use-act-uploads';
import { useStudioMusicRoute } from './use-studio-music-route';
import type { StudioScreen } from './use-studio-screen';

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

export interface StudioSetupRow {
  key: SetupKey;
  number: number;
  total: number;
  state: SetupState;
  ready: boolean;
  stateText: string;
  glyph: KkLaneGlyphName;
  title: string;
  hint: string;
  fact: string;
  actionText: string;
  act: () => void;
}

export interface StudioSetup {
  setup: Setup;
  shown: boolean;
  rows: StudioSetupRow[];
  progressText: string;
  progressLabel: string;
  songs: ActUploads;
  videos: ActUploads;
  rowOf: (key: SetupKey) => StudioSetupRow | null;
}

const uploadingOf = (uploads: ActUploads): string | null => {
  const first = uploads.rows[0];

  return first === undefined ? null : uploadFactOf(first.name, first.share);
};

export const useStudioSetup = (
  screen: StudioScreen,
  editor: ActStudioStage,
  host: StudioSetupHost,
): StudioSetup => {
  const { playback, manual, mode, studio } = screen;
  const setup = setupOf(studio);
  const shown = setupShownOf(studio, screen.evening !== null);
  const stepsDone = setup.rows.some((row) => row.key === 'steps' && row.state === 'done');
  const songs = useActUploads(screen.actId, screen.music.add.mutateAsync);
  const videos = useActUploads(screen.actId, screen.videos.add.mutateAsync);
  const openMusic = useStudioMusicRoute(screen.actId);
  const actions: Record<SetupKey, () => void> = {
    music: songs.choose,
    steps: () => {
      host.leave();
      if (stepsDone) {
        host.showStep(playback.steps[0]?.stepId ?? null);
        return;
      }
      playback.player.seek(0);
      manual.mark.mutate(markSecondsOf(playback, 0));
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
      openMusic('music');
    },
  };
  const uploading: Partial<Record<SetupKey, string | null>> = {
    music: uploadingOf(songs),
    video: uploadingOf(videos),
  };
  const rows = setup.rows.map((row) => ({
    key: row.key,
    number: row.number,
    total: setup.total,
    state: row.state,
    ready: row.ready,
    stateText: SETUP_STATES[row.state],
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

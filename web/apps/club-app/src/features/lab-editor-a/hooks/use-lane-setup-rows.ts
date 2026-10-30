import type { KkLaneChecklistState } from '@furria/ui/KkLaneChecklist';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';
import type { ActUploads } from '@/features/act-studio/hooks/use-act-uploads';
import { useActUploads } from '@/features/act-studio/hooks/use-act-uploads';
import { SETUP_ACTIONS, SETUP_STATES, SETUP_TITLES, setupFactOf, uploadFactOf } from '../lane-copy';
import type { SetupKey } from '../lane-setup';
import type { LaneEditor } from './use-lane-editor';
import { useLaneRoutes } from './use-lane-routes';

const GLYPHS: Record<SetupKey, KkLaneGlyphName> = {
  music: 'music',
  steps: 'steps',
  spots: 'spots',
  formation: 'formation',
  video: 'video',
  final: 'final',
};

export interface LaneSetupRow {
  key: SetupKey;
  index: number;
  state: KkLaneChecklistState;
  stateText: string;
  glyph: KkLaneGlyphName;
  title: string;
  fact: string;
  actionText: string;
  act: () => void;
}

export interface LaneSetupRows {
  rows: LaneSetupRow[];
  songs: ActUploads;
  videos: ActUploads;
}

const uploadingOf = (uploads: ActUploads): string | null => {
  const first = uploads.rows[0];
  return first === undefined ? null : uploadFactOf(first.name, first.share);
};

export const useLaneSetupRows = (lane: LaneEditor, leave: () => void): LaneSetupRows => {
  const { screen, editor } = lane;
  const songs = useActUploads(screen.actId, screen.music.add.mutateAsync);
  const videos = useActUploads(screen.actId, screen.videos.add.mutateAsync);
  const routes = useLaneRoutes(screen.actId, screen.evening);
  const actions: Record<SetupKey, () => void> = {
    music: songs.choose,
    steps: () => {
      leave();
      screen.playback.player.seek(0);
      lane.focusStep(null);
    },
    spots: () => {
      leave();
      lane.chooseStageTool('formation');
      editor.addSpot();
      lane.focusSpots();
    },
    formation: () => {
      leave();
      lane.chooseStageTool('formation');
      lane.focusStep(screen.playback.steps[0]?.stepId ?? null);
    },
    video: videos.choose,
    final: () => {
      routes.openMusic('music');
    },
  };
  const uploading: Partial<Record<SetupKey, string | null>> = {
    music: uploadingOf(songs),
    video: uploadingOf(videos),
  };

  return {
    rows: lane.setup.rows.map((row, index) => ({
      key: row.key,
      index: index + 1,
      state: row.state,
      stateText: SETUP_STATES[row.state],
      glyph: GLYPHS[row.key],
      title: SETUP_TITLES[row.key],
      fact: uploading[row.key] ?? setupFactOf(row),
      actionText: SETUP_ACTIONS[row.key],
      act: actions[row.key],
    })),
    songs,
    videos,
  };
};

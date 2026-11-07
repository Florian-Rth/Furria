import { clockOf } from '@furria/studio/desk-copy';
import type { TimedStep } from '@furria/studio/setup-progress';
import { stepsInRangeOf } from '@furria/studio/setup-progress';
import type { SetupTask, SetupTool } from '@furria/studio/setup-task';
import { toolOf } from '@furria/studio/setup-task';
import {
  SS_GATE_TEXT,
  SS_MUSIC_PAGE,
  SS_UPLOAD_FAILED,
  SS_VIDEO_FAILED,
  SS_VIDEO_UNPLACED,
  SS_VIDEO_WAITING,
  uploadMetaOf,
  videoLengthOf,
  videoMetaOf,
  videoPlacedOf,
  videoStepCountOf,
} from '@furria/studio/step-setup-copy';
import { videoNameOf } from '@furria/studio/studio-copy';
import type { StudioVideo } from '@furria/studio/studio-schemas';
import type { StudioUploads } from '@furria/studio/studio-uploads';
import { clipSpanOf, videoNumberOf, videoShelfOf } from '@furria/studio/studio-videos';
import type { SetupMatch } from '@furria/studio/use-setup-match';
import { useSetupMatch } from '@furria/studio/use-setup-match';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { useStudioUploads } from '@furria/studio/use-studio-uploads';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

export interface SetupVideoRow {
  key: string;
  title: string;
  meta: string;
  selected: boolean;
  dimmed: boolean;
  press: (() => void) | undefined;
}

export interface SetupVideo {
  task: SetupTask;
  match: SetupMatch;
  rows: SetupVideoRow[];
  chosen: SetupVideoRow | null;
  upload: () => void;
  inputRef: (node: HTMLInputElement | null) => void;
  onChosen: (event: ChangeEvent<HTMLInputElement>) => void;
}

const stateMetaOf = (video: StudioVideo, steps: readonly TimedStep[]): string[] => {
  switch (videoShelfOf(video)) {
    case 'placed': {
      const range = clipSpanOf(video);
      const count = range === null ? 0 : stepsInRangeOf(steps, range).length;
      return [
        videoPlacedOf(clockOf(range?.start ?? 0)),
        ...(count === 0 ? [] : [videoStepCountOf(count)]),
      ];
    }
    case 'waiting':
      return [SS_VIDEO_WAITING];
    case 'failed':
      return [SS_VIDEO_FAILED];
    case 'unplaced':
      return [SS_VIDEO_UNPLACED];
  }
};

const lengthOf = (video: StudioVideo): number | null => {
  const range = clipSpanOf(video);

  return range === null ? video.durationSeconds : range.end - range.start;
};

const uploadRowsOf = (uploads: StudioUploads): SetupVideoRow[] =>
  uploads.rows.map((row) => ({
    key: `upload-${row.key}`,
    title: row.name,
    meta: row.failure === null ? uploadMetaOf(row.share) : SS_UPLOAD_FAILED,
    selected: false,
    dimmed: true,
    press:
      row.failure === null
        ? undefined
        : () => {
            uploads.dismiss(row.key);
          },
  }));

export const useSetupVideo = (setup: StepSetup): SetupVideo => {
  const { studio, uploads: ports } = setup.screen;
  const uploads = useStudioUploads(ports.videos);
  const match = useSetupMatch(setup);
  const [known, setKnown] = useState<ReadonlySet<number> | null>(null);
  const arrived =
    known === null ? undefined : studio.videos.find((video) => !known.has(video.videoId));
  if (arrived !== undefined) {
    setKnown(null);
    setup.adoptVideo(arrived.videoId);
  }
  const chosenId = setup.video?.videoId ?? null;
  const rowOf = (video: StudioVideo): SetupVideoRow => {
    const length = lengthOf(video);
    const failed = videoShelfOf(video) === 'failed';

    return {
      key: String(video.videoId),
      title: videoNameOf(video.name, videoNumberOf(studio.videos, video.videoId)),
      meta: videoMetaOf([
        ...(length === null ? [] : [videoLengthOf(clockOf(length))]),
        ...stateMetaOf(video, setup.steps),
      ]),
      selected: video.videoId === chosenId,
      dimmed: failed,
      press: failed
        ? undefined
        : () => {
            setup.chooseVideo(video.videoId);
          },
    };
  };
  const videoRows = [...studio.videos].reverse().map(rowOf);
  const chosenVideo = setup.video;
  const chosen =
    chosenVideo === null
      ? null
      : {
          ...rowOf(chosenVideo),
          press: () => {
            setup.chooseVideo(null);
          },
        };
  const musicTool = toolOf('music', SS_MUSIC_PAGE, () => {
    setup.screen.openMusic('music');
  });
  const { hasMusic } = setup.facts;
  const noMusic = !hasMusic && match.phase === 'none';
  const checking = match.nudges.length > 0;
  const tools: SetupTool[] = noMusic ? [musicTool] : checking ? match.nudges : match.fixes;

  return {
    task: {
      sentence: noMusic ? SS_GATE_TEXT.noMusic : match.sentence,
      tools,
      more: checking ? match.fixes : [],
    },
    match,
    rows: [...uploadRowsOf(uploads), ...videoRows],
    chosen,
    upload: uploads.choose,
    inputRef: uploads.fileInput,
    onChosen: (event) => {
      setKnown(new Set(studio.videos.map((video) => video.videoId)));
      uploads.onChosen(event);
    },
  };
};

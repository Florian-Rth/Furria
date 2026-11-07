import type { CentreTarget } from '@furria/studio/centre-targets';
import { clockOf, videoBlockLabelOf } from '@furria/studio/desk-copy';
import { musicTicksOf } from '@furria/studio/desk-time';
import { videoNameOf } from '@furria/studio/studio-copy';
import type { StudioVideo } from '@furria/studio/studio-schemas';
import type {
  TimelinePartsLayer,
  TimelineStepsLayer,
  TimelineVideoSound,
  TimelineVideosLayer,
  TimelineWaveLayer,
} from '@furria/studio/studio-timeline-layers';
import { TIMELINE_LANE } from '@furria/studio/studio-timeline-layers';
import { clipSpanOf, videoNumberOf } from '@furria/studio/studio-videos';
import type { TimelineHandle } from '@furria/studio/Timeline';
import { timelineRowsOf } from '@furria/studio/timeline-rows';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import { soundClipOf, soundSegmentOf, soundSpanOf } from '@furria/studio/video-sound';
import type { WaveReadout } from '@furria/studio/wave-readout';
import { waveReadoutOf } from '@furria/studio/wave-readout';
import { useEffect, useEffectEvent } from 'react';
import { useSoundPeaks } from '@/features/acts/api';
import type { StepSetup } from './use-step-setup';

export interface SetupTarget extends CentreTarget {
  start?: () => void;
  move?: (seconds: number) => void;
  end?: (seconds: number) => void;
  cancel?: () => void;
  tap?: () => void;
}

export interface SetupTimelineOptions {
  targets: readonly SetupTarget[];
  startAt: number | null;
  borders?: readonly TimelineHandle[];
  stepTaps?: ((stepId: number) => void) | null;
  selectedStepId?: number | null;
  videoNote?: string | null;
}

export interface SetupTimeline {
  centre: CentreScrub;
  length: number;
  wave: TimelineWaveLayer;
  parts: TimelinePartsLayer | null;
  steps: TimelineStepsLayer;
  videos: TimelineVideosLayer;
  videoNote: string | null;
  readout: WaveReadout | null;
}

export const videoKeyOf = (videoId: number): string => `video-${videoId}`;

const placedOf = (video: StudioVideo): boolean =>
  video.state === 'ready' && video.placement === 'onTimeline' && video.startSeconds !== null;

export const useSetupTimeline = (
  setup: StepSetup,
  {
    targets,
    startAt,
    borders,
    stepTaps = null,
    selectedStepId = null,
    videoNote = null,
  }: SetupTimelineOptions,
): SetupTimeline => {
  const { screen, video } = setup;
  const { playback, practice, studio } = screen;
  const { player, length, countMarks, paths, segments } = playback;
  const currentId = practice.step?.stepId ?? null;
  const rows = timelineRowsOf(studio, paths, countMarks, currentId);
  const ready = video?.state === 'ready';
  const peaks = useSoundPeaks(
    video === null || !ready
      ? null
      : { mediaItemId: video.mediaItemId, peaksUrl: video.urls.peaks },
  );
  const stepTargets: SetupTarget[] =
    stepTaps === null
      ? []
      : rows.steps.flatMap((step) =>
          step.range === null
            ? []
            : [
                {
                  key: `step-${step.key}`,
                  seconds: step.range.start,
                  until: step.range.end,
                  lane: TIMELINE_LANE.steps,
                  movable: false,
                  tappable: true,
                  tap: () => {
                    stepTaps(step.key);
                  },
                },
              ],
        );
  const all = [...stepTargets, ...targets];
  const targetOf = (key: string): SetupTarget | undefined =>
    all.find((target) => target.key === key);

  const centre = useCentreScrub({
    player,
    length,
    countMarks,
    targets: all,
    onTargetStart: (key) => {
      targetOf(key)?.start?.();
    },
    onTargetMove: (key, seconds) => {
      targetOf(key)?.move?.(seconds);
    },
    onTargetEnd: (key, seconds) => {
      targetOf(key)?.end?.(seconds);
    },
    onTargetCancel: (key) => {
      targetOf(key)?.cancel?.();
    },
    onTargetTap: (key) => {
      targetOf(key)?.tap?.();
    },
  });

  const enterAt = useEffectEvent((): void => {
    if (startAt !== null) {
      centre.centreOn(startAt);
    }
  });
  useEffect(() => {
    enterAt();
  }, []);

  const nameOf = (shown: StudioVideo): string =>
    videoNameOf(shown.name, videoNumberOf(studio.videos, shown.videoId));
  const blocks = studio.videos.filter(placedOf).flatMap((shown) => {
    const range = clipSpanOf(shown);
    if (range === null) {
      return [];
    }
    const name = nameOf(shown);

    return [
      {
        key: videoKeyOf(shown.videoId),
        range,
        lead: null,
        title: name,
        meta: clockOf(range.end - range.start),
        selected: false,
        current: shown.videoId === video?.videoId,
        label: videoBlockLabelOf(name),
        onPress: () => {
          centre.centreOn(range.start);
        },
      },
    ];
  });
  const clip = video === null ? null : soundClipOf(video);
  const placed = video !== null && placedOf(video);
  const sound: TimelineVideoSound | null =
    video === null || clip === null || !placed || video.startSeconds === null
      ? null
      : {
          segments: [soundSegmentOf(video, clip, video.startSeconds)],
          peaks,
          band: {
            key: videoKeyOf(video.videoId),
            range: soundSpanOf(clip, video.startSeconds),
            title: nameOf(video),
          },
        };

  return {
    centre,
    length,
    wave: {
      segments,
      peaks: playback.peaksByItem,
      cuts: true,
      beats: musicTicksOf(countMarks, centre.pxPerSecond),
    },
    parts: rows.parts.length === 0 ? null : { parts: rows.parts, tone: null },
    steps: {
      steps: rows.steps,
      activeKey: currentId,
      selectedKey: selectedStepId,
      borders,
    },
    videos: { blocks, sound },
    videoNote,
    readout: waveReadoutOf(centre.readout, segments),
  };
};

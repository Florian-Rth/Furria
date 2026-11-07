import type { CutSpan } from '@furria/studio/studio-cuts';
import type { VideoAlignment } from '@furria/studio/studio-schemas';
import { TIMELINE_LANE } from '@furria/studio/studio-timeline-layers';
import { clampedVideoStartOf } from '@furria/studio/studio-videos';
import { soundClipOf, soundSpanOf, videoStartOfDrag } from '@furria/studio/video-sound';
import { useEffect, useEffectEvent, useState } from 'react';
import {
  SS_EARLIER_BIG,
  SS_EARLIER_BIG_LABEL,
  SS_EARLIER_SMALL,
  SS_EARLIER_SMALL_LABEL,
  SS_LATER_BIG,
  SS_LATER_BIG_LABEL,
  SS_LATER_SMALL,
  SS_LATER_SMALL_LABEL,
  SS_MATCH_CHECK,
  SS_MATCH_FAILED,
  SS_MATCH_MISSING,
  SS_MATCH_SEARCHING,
  SS_MATCH_WAITING,
  SS_SEARCH_AGAIN,
  SS_START_HERE,
  SS_START_HERE_LABEL,
  SS_VIDEO_PICK,
} from '../setup-copy';
import type { MatchPhase } from '../setup-match';
import { matchPhaseOf } from '../setup-match';
import type { SetupTool } from '../setup-task';
import { toolOf } from '../setup-task';
import type { SetupTarget, SetupTimeline } from './use-setup-timeline';
import { useSetupTimeline, videoKeyOf } from './use-setup-timeline';
import type { StepSetup } from './use-step-setup';

const BIG_SECONDS = 1;
const SMALL_SECONDS = 0.1;
const NO_CLIP: CutSpan = { startSeconds: 0, endSeconds: 0 };

const SENTENCE: Record<MatchPhase, string> = {
  none: SS_VIDEO_PICK,
  waiting: SS_MATCH_WAITING,
  searching: SS_MATCH_SEARCHING,
  check: SS_MATCH_CHECK,
  missing: SS_MATCH_MISSING,
  failed: SS_MATCH_FAILED,
};

export interface SetupMatch {
  phase: MatchPhase;
  sentence: string;
  nudges: SetupTool[];
  fixes: SetupTool[];
  timeline: SetupTimeline;
}

export const useSetupMatch = (setup: StepSetup): SetupMatch => {
  const { screen, video, range } = setup;
  const { playback, videos } = screen;
  const work = screen.document;
  const { player, length } = playback;
  const [failedId, setFailedId] = useState<number | null>(null);
  const clip = (video === null ? null : soundClipOf(video)) ?? NO_CLIP;
  const aligning = video !== null && videos.aligning(video.videoId);
  const placed = video !== null && video.startSeconds !== null && video.placement === 'onTimeline';
  const videoStart = placed ? video.startSeconds : null;
  const phase = matchPhaseOf({
    chosen: video !== null,
    ready: video?.state === 'ready',
    aligning,
    placed,
    searchFailed: video !== null && failedId === video.videoId,
  });
  const placeAt = (startSeconds: number): void => {
    if (video !== null) {
      work.change({ kind: 'videoStart', videoId: video.videoId, startSeconds });
    }
  };
  const span = videoStart === null ? null : soundSpanOf(clip, videoStart);
  const soundTargets: SetupTarget[] =
    span === null || aligning || video === null
      ? []
      : [
          {
            key: videoKeyOf(video.videoId),
            seconds: span.start,
            until: span.end,
            lane: TIMELINE_LANE.videos,
            snaps: false,
            move: (seconds) => {
              work.startGesture();
              placeAt(videoStartOfDrag(seconds, clip, length));
            },
            end: work.endGesture,
            cancel: work.endGesture,
          },
        ];
  const timeline = useSetupTimeline(setup, {
    targets: soundTargets,
    startAt: range?.start ?? null,
  });
  const videoId = video?.videoId ?? null;
  const centreOnVideo = useEffectEvent((): void => {
    if (range !== null) {
      timeline.centre.centreOn(range.start);
    }
  });
  useEffect(() => {
    centreOnVideo();
  }, [videoId, placed]);
  const base = { phase, sentence: SENTENCE[phase], timeline };

  if (video === null || phase === 'waiting' || phase === 'searching') {
    return { ...base, nudges: [], fixes: [] };
  }

  const startAt = (startSeconds: number): void => {
    placeAt(clampedVideoStartOf(startSeconds, clip, length));
  };
  const shift =
    (delta: number): (() => void) =>
    () => {
      startAt((video.startSeconds ?? player.position() - clip.startSeconds) + delta);
    };
  const startHere = toolOf(
    'startHere',
    SS_START_HERE,
    () => {
      startAt(player.position() - clip.startSeconds);
    },
    SS_START_HERE_LABEL,
  );
  const search = toolOf('search', SS_SEARCH_AGAIN, () => {
    setFailedId(null);
    const aligned = ({ startSeconds }: VideoAlignment): void => {
      placeAt(startSeconds);
    };
    const failed = (): void => {
      setFailedId(video.videoId);
    };
    void videos.align(video.videoId).then(aligned, failed);
  });

  if (!placed) {
    return { ...base, nudges: [], fixes: [startHere, search] };
  }

  return {
    ...base,
    nudges: [
      toolOf('earlierBig', SS_EARLIER_BIG, shift(-BIG_SECONDS), SS_EARLIER_BIG_LABEL),
      toolOf('earlierSmall', SS_EARLIER_SMALL, shift(-SMALL_SECONDS), SS_EARLIER_SMALL_LABEL),
      toolOf('laterSmall', SS_LATER_SMALL, shift(SMALL_SECONDS), SS_LATER_SMALL_LABEL),
      toolOf('laterBig', SS_LATER_BIG, shift(BIG_SECONDS), SS_LATER_BIG_LABEL),
    ],
    fixes: [startHere, search],
  };
};

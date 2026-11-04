import type { CutDesk } from '@furria/studio/cut-desk';
import { cutDeskOf } from '@furria/studio/cut-desk';
import { partRangeOf } from '@furria/studio/music-timeline';
import { videoNameOf } from '@furria/studio/studio-copy';
import type { CutSpan } from '@furria/studio/studio-cuts';
import { playheadInOf } from '@furria/studio/studio-cuts';
import type { VideoAlignment } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { partSettingsOf } from '@furria/studio/studio-steps';
import {
  clampedVideoStartOf,
  clipOf,
  clipSpanOf,
  overlapsRange,
  videoNumberOf,
  videoShelfOf,
} from '@furria/studio/studio-videos';
import type { ActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useCutReach } from '@furria/studio/use-cut-reach';
import { useState } from 'react';

export interface VideoDeskPart {
  key: string;
  text: string;
  variant: 'contained' | 'outlined';
  press: () => void;
}

export interface VideoDesk {
  title: string;
  name: string;
  rename: (name: string) => void;
  commitName: () => void;
  aligning: boolean;
  alignLocked: boolean;
  align: () => void;
  startHere: () => void;
  startLocked: boolean;
  cut: CutDesk | null;
  parts: VideoDeskPart[];
  removing: boolean;
  remove: () => void;
}

interface Draft {
  videoId: number;
  name: string;
}

export const useVideoDesk = (screen: StudioScreen, takes: ActStudioTakes): VideoDesk | null => {
  const { videos, playback, studio } = screen;
  const work = screen.document;
  const { player, parts, steps, length } = playback;
  const video = takes.selected;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  if (removingId !== null && (!takes.deskOpen || video?.videoId !== removingId)) {
    setRemovingId(null);
  }
  const clip = video === null || video.state !== 'ready' ? null : clipOf(video);
  const span = video === null ? null : clipSpanOf(video);
  const clips: readonly CutSpan[] = clip === null ? [] : [clip];
  const playheadAt = (seconds: number): number | null =>
    span === null || clip === null
      ? null
      : playheadInOf(span.start, span.end, clip.startSeconds, seconds);
  const reach = useCutReach(player, clips, 0, video?.durationSeconds ?? null, playheadAt);

  if (video === null) {
    return null;
  }

  const trimmed = (pieces: CutSpan[]): void => {
    const [next] = pieces;
    if (next !== undefined) {
      work.change({
        kind: 'videoClip',
        videoId: video.videoId,
        startSeconds: next.startSeconds,
        endSeconds: next.endSeconds,
      });
    }
  };

  const covered =
    videoShelfOf(video) === 'placed'
      ? parts.filter((part) => {
          const range = partRangeOf(part, steps);
          return range !== null && overlapsRange(video, range);
        })
      : [];
  const aligning = videos.aligning(video.videoId);

  return {
    title: videoNameOf(video.name, videoNumberOf(studio.videos, video.videoId)),
    name: draft?.videoId === video.videoId ? draft.name : (video.name ?? ''),
    rename: (value) => {
      setDraft({ videoId: video.videoId, name: value });
    },
    commitName: () => {
      if (draft === null || draft.videoId !== video.videoId) {
        return;
      }
      const name = draft.name.trim() === '' ? null : draft.name.trim();
      setDraft(null);
      work.change({ kind: 'videoName', videoId: video.videoId, name });
    },
    aligning,
    alignLocked: video.state !== 'ready' || aligning,
    align: () => {
      const aligned = ({ startSeconds }: VideoAlignment): void => {
        work.change({ kind: 'videoStart', videoId: video.videoId, startSeconds });
      };
      void videos.align(video.videoId).then(aligned, () => undefined);
    },
    startHere: () => {
      if (clip === null) {
        return;
      }
      work.change({
        kind: 'videoStart',
        videoId: video.videoId,
        startSeconds: clampedVideoStartOf(player.position() - clip.startSeconds, clip, length),
      });
    },
    startLocked: clip === null || length <= 0,
    cut:
      clip === null
        ? null
        : cutDeskOf({
            pieces: clips,
            index: 0,
            limit: video.durationSeconds,
            reach,
            playhead: () => playheadAt(player.position()),
            trim: (_, pieces) => {
              trimmed(pieces);
            },
            split: (atSeconds) => {
              videos.split({ videoId: video.videoId, atSeconds });
            },
          }),
    parts: covered.map((part) => {
      const main = part.mainVideoId === video.videoId;
      return {
        key: String(part.partId),
        text: part.name,
        variant: main ? 'contained' : 'outlined',
        press: () => {
          work.change({
            kind: 'partSettings',
            partId: part.partId,
            ...partSettingsOf(part),
            mainVideoId: main ? null : video.videoId,
          });
        },
      };
    }),
    removing: removingId === video.videoId,
    remove: () => {
      if (removingId !== video.videoId) {
        setRemovingId(video.videoId);
        return;
      }
      setRemovingId(null);
      takes.closeDesk();
      videos.remove(video.videoId);
    },
  };
};

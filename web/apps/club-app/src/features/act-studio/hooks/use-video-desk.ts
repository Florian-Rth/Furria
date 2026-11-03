import { partRangeOf } from '@furria/studio/music-timeline';
import { videoNameOf } from '@furria/studio/studio-copy';
import { partSettingsOf } from '@furria/studio/studio-steps';
import { clampedVideoStartOf, overlapsRange, videoShelfOf } from '@furria/studio/studio-videos';
import { useState } from 'react';
import type { VideoMutations } from '../api';
import type { VideoAlignment } from '../schemas';
import type { ActStudioTakes } from './use-act-studio-takes';
import type { StudioScreen } from './use-studio-screen';

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
  parts: VideoDeskPart[];
  removing: boolean;
  remove: () => void;
}

interface Draft {
  videoId: number;
  name: string;
}

export const useVideoDesk = (screen: StudioScreen, takes: ActStudioTakes): VideoDesk | null => {
  const { videos: writes, playback, studio } = screen;
  const work = screen.document;
  const { player, parts, steps, length } = playback;
  const video = takes.selected;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  if (removingId !== null && (!takes.deskOpen || video?.videoId !== removingId)) {
    setRemovingId(null);
  }

  if (video === null) {
    return null;
  }

  const index = studio.videos.findIndex((candidate) => candidate.videoId === video.videoId);
  const covered =
    videoShelfOf(video) === 'placed'
      ? parts.filter((part) => {
          const range = partRangeOf(part, steps);
          return range !== null && overlapsRange(video, range);
        })
      : [];
  const aligningBy = (mutation: VideoMutations['align']): boolean =>
    mutation.isPending && mutation.variables === video.videoId;
  const aligning = aligningBy(writes.align) || aligningBy(writes.autoAlign);

  return {
    title: videoNameOf(video.name, index + 1),
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
      void writes.align.mutateAsync(video.videoId).then(aligned, () => undefined);
    },
    startHere: () => {
      work.change({
        kind: 'videoStart',
        videoId: video.videoId,
        startSeconds: clampedVideoStartOf(player.position(), video.durationSeconds ?? 0, length),
      });
    },
    startLocked: video.state !== 'ready' || length <= 0,
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
      writes.remove.mutate(video.videoId);
    },
  };
};

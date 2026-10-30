import { useState } from 'react';
import { partRangeOf } from '@/features/act-player/music-timeline';
import type { VideoMutations } from '../api';
import { videoNameOf } from '../studio-copy';
import { partSettingsOf } from '../studio-steps';
import { clampedVideoStartOf, overlapsRange, videoShelfOf } from '../studio-videos';
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
  const { videos: writes, manual, playback, studio } = screen;
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
      const clear = (): void => {
        setDraft((current) => (current === draft ? null : current));
      };
      if (name === video.name) {
        clear();
        return;
      }
      void writes.rename.mutateAsync({ videoId: video.videoId, name }).then(clear, clear);
    },
    aligning,
    alignLocked: video.state !== 'ready' || aligning,
    align: () => {
      writes.align.mutate(video.videoId);
    },
    startHere: () => {
      writes.place.mutate({
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
          manual.settlePart.mutate({
            partId: part.partId,
            settings: { ...partSettingsOf(part), mainVideoId: main ? null : video.videoId },
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

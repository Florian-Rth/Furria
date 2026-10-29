import type { KkStudioEVideoSource } from '@furria/ui/KkStudioEVideo';
import type { RefObject } from 'react';
import { useRef, useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { videoAt } from '@/features/act-player/video-sync';
import type { Studio } from '@/features/acts/schemas';

export interface StudioEVideo {
  ref: RefObject<HTMLVideoElement | null>;
  source: KkStudioEVideoSource | null;
  caption: string | null;
  open: boolean;
  mirrored: boolean;
  toggleOpen: () => void;
  close: () => void;
  toggleMirror: () => void;
}

export const useStudioEVideo = (studio: Studio, playback: StudioPlayback): StudioEVideo => {
  const { player, parts, steps } = playback;
  const ref = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [mirrored, setMirrored] = useState(true);
  const videoId = usePlaybackSelection(
    player,
    (seconds) => videoAt(studio.videos, parts, steps, seconds)?.videoId ?? null,
  );
  const video = studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;
  const part = parts.find((candidate) => candidate.mainVideoId === videoId) ?? null;

  useSlavedVideo(player, video, ref);

  return {
    ref,
    source: video === null ? null : { video: video.urls.video, poster: video.urls.poster },
    caption: video === null ? null : (part?.name ?? video.name ?? null),
    open,
    mirrored,
    toggleOpen: () => {
      setOpen((shown) => !shown);
    },
    close: () => {
      setOpen(false);
    },
    toggleMirror: () => {
      setMirrored((flipped) => !flipped);
    },
  };
};

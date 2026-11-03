import { videoSourceOf } from '@furria/studio/practice-controls';
import {
  STUDIO_FILM_EMPTY,
  STUDIO_FILM_UNPLACED,
  takeMetaOf,
  videoNameOf,
} from '@furria/studio/studio-copy';
import type { StudioVideo } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { videoNumberOf } from '@furria/studio/studio-videos';
import type { ActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { placedOf } from '@furria/studio/use-act-studio-takes';
import { useSlavedVideo } from '@furria/studio/use-slaved-video';
import type { KkLaneFilmSource } from '@furria/ui/KkLaneFilm';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { RefObject } from 'react';
import { useRef } from 'react';

export interface VideoFilm {
  ref: RefObject<HTMLVideoElement | null>;
  source: KkLaneFilmSource | null;
  title: string | null;
  meta: string | null;
  note: string | null;
  canNudge: boolean;
  earlier: () => void;
  later: () => void;
  edit: () => void;
}

const filmMetaOf = (video: StudioVideo, placed: boolean): string =>
  placed ? takeMetaOf(video.startSeconds, video.durationSeconds) : STUDIO_FILM_UNPLACED;

export const useVideoFilm = (screen: StudioScreen, takes: ActStudioTakes): VideoFilm => {
  const { studio, playback } = screen;
  const ref = useRef<HTMLVideoElement>(null);
  const compact = useIsMobile();
  const video = takes.selected;
  const placed = video !== null && placedOf(video);
  useSlavedVideo(playback.player, placed ? video : null, ref);

  return {
    ref,
    source: video === null || video.state !== 'ready' ? null : videoSourceOf(video, compact),
    title:
      video === null ? null : videoNameOf(video.name, videoNumberOf(studio.videos, video.videoId)),
    meta: video === null ? null : filmMetaOf(video, placed),
    note: video === null ? STUDIO_FILM_EMPTY : null,
    canNudge: takes.canNudge,
    earlier: () => {
      takes.nudge('earlier');
    },
    later: () => {
      takes.nudge('later');
    },
    edit: takes.openDesk,
  };
};

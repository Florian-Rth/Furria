import type { KkPracticeScreenVideoSource } from '@furria/ui/KkPracticeScreen';
import { useIsMobile } from '@furria/ui/use-is-mobile';
import type { RefObject } from 'react';
import { useRef, useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { HeroKind } from '../practice-controls';
import {
  heroOf,
  nextVideoIdOf,
  partVideosOf,
  shownVideoIdOf,
  videoSourceOf,
} from '../practice-controls';
import { takeLabelOf, takeTextOf } from '../practice-copy';

const ID_SEPARATOR = ',';

export interface PracticeTake {
  text: string;
  label: string;
  next: () => void;
}

export interface PracticeVideo {
  ref: RefObject<HTMLVideoElement | null>;
  shownId: number | null;
  source: KkPracticeScreenVideoSource | null;
  hero: HeroKind;
  mirrored: boolean;
  take: PracticeTake | null;
  toggleMirror: () => void;
}

const idsOf = (joined: string): number[] =>
  joined === '' ? [] : joined.split(ID_SEPARATOR).map(Number);

export const usePracticeVideo = (studio: Studio, playback: StudioPlayback): PracticeVideo => {
  const { player, parts, steps } = playback;
  const ref = useRef<HTMLVideoElement>(null);
  const compact = useIsMobile();
  const [mirrored, setMirrored] = useState(true);
  const [chosenId, setChosenId] = useState<number | null>(null);
  const choiceIds = idsOf(
    usePlaybackSelection(player, (seconds) =>
      partVideosOf(studio.videos, parts, steps, seconds)
        .map((video) => video.videoId)
        .join(ID_SEPARATOR),
    ),
  );
  const videoId = shownVideoIdOf(choiceIds, chosenId);
  const video = studio.videos.find((candidate) => candidate.videoId === videoId) ?? null;
  const [shownId, setShownId] = useState(videoId);

  if (videoId !== null && videoId !== shownId) {
    setShownId(videoId);
  }

  const shown = studio.videos.find((candidate) => candidate.videoId === shownId) ?? null;

  useSlavedVideo(player, video, ref);

  const takeIndex = videoId === null ? -1 : choiceIds.indexOf(videoId);

  return {
    ref,
    shownId: shown?.videoId ?? null,
    source: shown === null ? null : videoSourceOf(shown, compact),
    hero: heroOf(video),
    mirrored,
    take:
      choiceIds.length < 2 || takeIndex < 0
        ? null
        : {
            text: takeTextOf(takeIndex, choiceIds.length),
            label: takeLabelOf(takeIndex, choiceIds.length),
            next: () => {
              setChosenId(nextVideoIdOf(choiceIds, videoId));
            },
          },
    toggleMirror: () => {
      setMirrored((flipped) => !flipped);
    },
  };
};

import type { KkStudioHListBadgeTone } from '@furria/ui/KkStudioHList';
import type { KkStudioHNudgeDirection } from '@furria/ui/KkStudioHPlacement';
import { useRef, useState } from 'react';
import { partRangeOf } from '@/features/act-player/music-timeline';
import type { StudioVideo } from '@/features/acts/schemas';
import {
  placementTextOf,
  STUDIO_H_ALTERNATIVE,
  STUDIO_H_MAIN,
  STUDIO_H_NO_VIDEO_HERE,
  STUDIO_H_OUTDATED,
  takeMetaOf,
  videoBarLabelOf,
} from '../studio-h-copy';
import type { StageShare } from '../studio-h-edits';
import { offsetOf } from '../studio-h-edits';
import type { StudioH } from './use-studio-h';

const NUDGE_SECONDS = 0.1;

export interface StudioHVideoBar {
  key: string;
  start: number;
  end: number;
  label: string;
  selected: boolean;
  press: (share: StageShare) => void;
  move: (share: StageShare) => void;
  finish: () => void;
}

export interface StudioHTakeRow {
  key: string;
  lead: string;
  title: string;
  meta: string;
  badge: string | null;
  badgeTone: KkStudioHListBadgeTone;
  selected: boolean;
  press: () => void;
}

export interface StudioHTakeGroup {
  key: string;
  name: string;
  aside: string | null;
  rows: StudioHTakeRow[];
}

export interface StudioHTakes {
  parts: { key: string; start: number; end: number; name: string }[];
  bars: StudioHVideoBar[];
  text: string;
  changed: boolean;
  canNudge: boolean;
  nudge: (direction: KkStudioHNudgeDirection) => void;
  groups: StudioHTakeGroup[];
}

interface Grab {
  x: number;
  offset: number;
}

const placed = (video: StudioVideo): boolean =>
  video.placement === 'onTimeline' && video.startSeconds !== null && video.durationSeconds !== null;

export const useStudioHTakes = (h: StudioH): StudioHTakes => {
  const { playback, studio, video, edits } = h;
  const { player, length, parts, steps } = playback;
  const [chosenId, setChosenId] = useState<number | null>(null);
  const grab = useRef<Grab | null>(null);
  const shareOf = (seconds: number): number => (length <= 0 ? 0 : seconds / length);
  const videos = studio.videos.filter(placed);
  const shownId =
    studio.videos.find((candidate) => candidate.urls.video === video.source?.video)?.videoId ??
    null;
  const selected =
    videos.find((candidate) => candidate.videoId === chosenId) ??
    videos.find((candidate) => candidate.videoId === shownId) ??
    videos[0] ??
    null;
  const offsetFor = (videoId: number): number => edits.value.offsets[videoId] ?? 0;
  const baseStartOf = (candidate: StudioVideo): number =>
    (candidate.startSeconds ?? 0) - offsetFor(candidate.videoId);
  const select = (candidate: StudioVideo): void => {
    setChosenId(candidate.videoId);
  };

  return {
    parts: parts.flatMap((part) => {
      const range = partRangeOf(part, steps);
      return range === null
        ? []
        : [
            {
              key: String(part.partId),
              start: shareOf(range.start),
              end: shareOf(range.end),
              name: part.name,
            },
          ];
    }),
    bars: videos.map((candidate) => {
      const start = candidate.startSeconds ?? 0;
      return {
        key: String(candidate.videoId),
        start: shareOf(start),
        end: shareOf(start + (candidate.durationSeconds ?? 0)),
        label: videoBarLabelOf(candidate.name ?? STUDIO_H_MAIN),
        selected: candidate.videoId === selected?.videoId,
        press: (share) => {
          select(candidate);
          grab.current = { x: share.x, offset: offsetFor(candidate.videoId) };
        },
        move: (share) => {
          const held = grab.current;
          if (held === null) {
            return;
          }
          edits.setOffset(
            candidate.videoId,
            offsetOf(held.offset + (share.x - held.x) * length, baseStartOf(candidate), length),
          );
        },
        finish: () => {
          grab.current = null;
        },
      };
    }),
    text:
      selected === null
        ? STUDIO_H_NO_VIDEO_HERE
        : placementTextOf(
            selected.name ?? STUDIO_H_MAIN,
            selected.startSeconds ?? 0,
            offsetFor(selected.videoId),
          ),
    changed: selected !== null && offsetFor(selected.videoId) !== 0,
    canNudge: selected !== null,
    nudge: (direction) => {
      if (selected === null) {
        return;
      }
      const delta = direction === 'later' ? NUDGE_SECONDS : -NUDGE_SECONDS;
      edits.setOffset(
        selected.videoId,
        offsetOf(offsetFor(selected.videoId) + delta, baseStartOf(selected), length),
      );
    },
    groups: parts.map((part) => {
      const range = partRangeOf(part, steps);
      const takes = videos.filter(
        (candidate) =>
          range !== null &&
          (candidate.startSeconds ?? 0) < range.end &&
          (candidate.startSeconds ?? 0) + (candidate.durationSeconds ?? 0) > range.start,
      );
      const ordered = [
        ...takes.filter((candidate) => candidate.videoId === part.mainVideoId),
        ...takes.filter((candidate) => candidate.videoId !== part.mainVideoId),
      ];

      return {
        key: String(part.partId),
        name: part.name,
        aside: ordered.length === 0 ? STUDIO_H_NO_VIDEO_HERE : null,
        rows: ordered.map((candidate, index) => {
          const main = candidate.videoId === part.mainVideoId;
          const badge = candidate.outdated
            ? STUDIO_H_OUTDATED
            : main
              ? STUDIO_H_MAIN
              : STUDIO_H_ALTERNATIVE;
          return {
            key: `${part.partId}-${candidate.videoId}`,
            lead: String(index + 1),
            title: candidate.name ?? STUDIO_H_MAIN,
            meta: takeMetaOf(candidate.startSeconds, candidate.durationSeconds),
            badge,
            badgeTone: candidate.outdated ? 'gold' : main ? 'ink' : 'quiet',
            selected: candidate.videoId === selected?.videoId,
            press: () => {
              select(candidate);
              player.seek(Math.max(range?.start ?? 0, candidate.startSeconds ?? 0));
            },
          };
        }),
      };
    }),
  };
};

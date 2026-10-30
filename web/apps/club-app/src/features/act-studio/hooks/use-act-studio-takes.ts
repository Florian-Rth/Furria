import type { KkStudioListBadgeTone } from '@furria/ui/KkStudioList';
import type { KkStudioNudgeDirection } from '@furria/ui/KkStudioPlacement';
import { useState } from 'react';
import { partRangeOf } from '@/features/act-player/music-timeline';
import type { StudioVideo } from '@/features/acts/schemas';
import {
  placementTextOf,
  STUDIO_ALTERNATIVE,
  STUDIO_EDIT,
  STUDIO_MAIN,
  STUDIO_NO_VIDEO_HERE,
  STUDIO_OUTDATED,
  STUDIO_VIDEO_GONE,
  shelfMetaOf,
  takeMetaOf,
  videoBarLabelOf,
  videoNameOf,
} from '../studio-copy';
import type { StageShare } from '../studio-edits';
import { clampedVideoStartOf, overlapsRange, videoShelfOf } from '../studio-videos';
import { useDeskTarget } from './use-desk-target';
import type { StudioScreen } from './use-studio-screen';

const NUDGE_SECONDS = 0.1;

export interface ActStudioVideoBar {
  key: string;
  start: number;
  end: number;
  label: string;
  selected: boolean;
  press: (share: StageShare) => void;
  move: (share: StageShare) => void;
  finish: () => void;
}

export interface ActStudioTakeRow {
  key: string;
  lead: string;
  title: string;
  meta: string;
  badge: string | null;
  badgeTone: KkStudioListBadgeTone;
  selected: boolean;
  press: () => void;
}

export interface ActStudioTakeGroup {
  key: string;
  name: string;
  aside: string | null;
  rows: ActStudioTakeRow[];
}

export interface ActStudioTakes {
  parts: { key: string; start: number; end: number; name: string }[];
  bars: ActStudioVideoBar[];
  text: string;
  changed: boolean;
  canNudge: boolean;
  nudge: (direction: KkStudioNudgeDirection) => void;
  groups: ActStudioTakeGroup[];
  shelf: ActStudioTakeRow[];
  selected: StudioVideo | null;
  deskOpen: boolean;
  closeDesk: () => void;
}

interface Grab {
  x: number;
  start: number;
}

const placedOf = (video: StudioVideo): boolean =>
  videoShelfOf(video) === 'placed' && video.durationSeconds !== null;

export const useActStudioTakes = (screen: StudioScreen): ActStudioTakes => {
  const { playback, studio, video, edits, videos: writes, mode } = screen;
  const { player, length, parts, steps } = playback;
  const [chosenId, setChosenId] = useState<number | null>(null);
  const [grab, setGrab] = useState<Grab | null>(null);
  const onVideo = mode.editing && mode.tool === 'video';
  const desk = useDeskTarget(
    studio.videos.map((candidate) => candidate.videoId),
    onVideo,
    STUDIO_VIDEO_GONE,
  );
  const shareOf = (seconds: number): number => (length <= 0 ? 0 : seconds / length);
  const placed = studio.videos.filter(placedOf);
  const nameOf = (candidate: StudioVideo): string =>
    videoNameOf(candidate.name, studio.videos.indexOf(candidate) + 1);
  const selected =
    studio.videos.find((candidate) => candidate.videoId === desk.targetId) ??
    studio.videos.find((candidate) => candidate.videoId === chosenId) ??
    placed.find((candidate) => candidate.videoId === video.shownId) ??
    placed[0] ??
    null;
  const draftStart = selected === null ? undefined : edits.value.starts[selected.videoId];
  const saveStart = (candidate: StudioVideo, start: number): void => {
    const startSeconds = clampedVideoStartOf(start, candidate.durationSeconds ?? 0, length);
    const clear = (): void => {
      edits.clearStart(candidate.videoId, start);
    };
    void writes.place.mutateAsync({ videoId: candidate.videoId, startSeconds }).then(clear, clear);
  };
  const pressRow = (candidate: StudioVideo, seekTo: number | null): void => {
    if (candidate.videoId === selected?.videoId) {
      desk.open(candidate.videoId);
      return;
    }
    setChosenId(candidate.videoId);
    if (seekTo !== null) {
      player.seek(seekTo);
    }
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
    bars: placed.map((candidate) => {
      const start = candidate.startSeconds ?? 0;
      return {
        key: String(candidate.videoId),
        start: shareOf(start),
        end: shareOf(start + (candidate.durationSeconds ?? 0)),
        label: videoBarLabelOf(nameOf(candidate)),
        selected: candidate.videoId === selected?.videoId,
        press: (share) => {
          setChosenId(candidate.videoId);
          setGrab({ x: share.x, start });
        },
        move: (share) => {
          if (grab === null) {
            return;
          }
          edits.setStart(
            candidate.videoId,
            clampedVideoStartOf(
              grab.start + (share.x - grab.x) * length,
              candidate.durationSeconds ?? 0,
              length,
            ),
          );
        },
        finish: () => {
          setGrab(null);
          const moved = edits.value.starts[candidate.videoId];
          if (moved === undefined) {
            return;
          }
          if (grab !== null && moved !== grab.start) {
            saveStart(candidate, moved);
            return;
          }
          edits.clearStart(candidate.videoId, moved);
        },
      };
    }),
    text:
      selected === null || selected.startSeconds === null
        ? STUDIO_NO_VIDEO_HERE
        : placementTextOf(
            nameOf(selected),
            selected.startSeconds,
            draftStart === undefined || grab === null ? null : draftStart - grab.start,
          ),
    changed: draftStart !== undefined,
    canNudge: selected !== null && placedOf(selected),
    nudge: (direction) => {
      if (selected === null || selected.startSeconds === null) {
        return;
      }
      const delta = direction === 'later' ? NUDGE_SECONDS : -NUDGE_SECONDS;
      writes.place.mutate({
        videoId: selected.videoId,
        startSeconds: clampedVideoStartOf(
          selected.startSeconds + delta,
          selected.durationSeconds ?? 0,
          length,
        ),
      });
    },
    groups: parts.map((part) => {
      const range = partRangeOf(part, steps);
      const takes = placed.filter((candidate) => range !== null && overlapsRange(candidate, range));
      const ordered = [
        ...takes.filter((candidate) => candidate.videoId === part.mainVideoId),
        ...takes.filter((candidate) => candidate.videoId !== part.mainVideoId),
      ];

      return {
        key: String(part.partId),
        name: part.name,
        aside: ordered.length === 0 ? STUDIO_NO_VIDEO_HERE : null,
        rows: ordered.map((candidate, index) => {
          const main = candidate.videoId === part.mainVideoId;
          const isSelected = candidate.videoId === selected?.videoId;
          const badge = candidate.outdated
            ? STUDIO_OUTDATED
            : main
              ? STUDIO_MAIN
              : STUDIO_ALTERNATIVE;
          return {
            key: `${part.partId}-${candidate.videoId}`,
            lead: String(index + 1),
            title: nameOf(candidate),
            meta: takeMetaOf(candidate.startSeconds, candidate.durationSeconds),
            badge: isSelected && onVideo ? STUDIO_EDIT : badge,
            badgeTone: candidate.outdated ? 'gold' : main || isSelected ? 'ink' : 'quiet',
            selected: isSelected,
            press: () => {
              pressRow(candidate, Math.max(range?.start ?? 0, candidate.startSeconds ?? 0));
            },
          };
        }),
      };
    }),
    shelf: studio.videos
      .filter((candidate) => !placedOf(candidate))
      .map((candidate, index) => {
        const isSelected = candidate.videoId === selected?.videoId;
        return {
          key: String(candidate.videoId),
          lead: String(index + 1),
          title: nameOf(candidate),
          meta: shelfMetaOf(candidate.state, candidate.placement),
          badge: isSelected && onVideo ? STUDIO_EDIT : null,
          badgeTone: 'ink',
          selected: isSelected,
          press: () => {
            pressRow(candidate, null);
          },
        };
      }),
    selected,
    deskOpen: desk.targetId !== null,
    closeDesk: desk.close,
  };
};

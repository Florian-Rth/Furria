import {
  placementTextOf,
  STUDIO_NO_VIDEO_HERE,
  STUDIO_VIDEO_GONE,
  shelfMetaOf,
  takeBadgeOf,
  takeGroupNameOf,
  takeMetaOf,
  videoNameOf,
} from '@furria/studio/studio-copy';
import { STUDIO_EDIT } from '@furria/studio/studio-mode-copy';
import type { StudioVideo } from '@furria/studio/studio-schemas';
import {
  clampedVideoStartOf,
  clipOf,
  clipSpanOf,
  takeGroupsOf,
  videoNumberOf,
  videoShelfOf,
} from '@furria/studio/studio-videos';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import { useSheetTarget } from '@furria/studio/use-sheet-target';
import type { KkStudioListBadgeTone } from '@furria/ui/KkStudioList';
import { useState } from 'react';

const NUDGE_SECONDS = 0.1;
const LOOSE_GROUP_KEY = 'loose';

export type VideoNudgeDirection = 'earlier' | 'later';

export interface ActStudioVideoBar {
  key: string;
  start: number;
  end: number;
  startSeconds: number;
  endSeconds: number;
  title: string;
  meta: string;
  selected: boolean;
  moveTo: (seconds: number) => void;
  choose: () => void;
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
  bars: ActStudioVideoBar[];
  text: string;
  canNudge: boolean;
  nudge: (direction: VideoNudgeDirection) => void;
  groups: ActStudioTakeGroup[];
  shelf: ActStudioTakeRow[];
  selected: StudioVideo | null;
  deskOpen: boolean;
  openDesk: () => void;
  closeDesk: () => void;
}

export const placedOf = (video: StudioVideo): boolean =>
  videoShelfOf(video) === 'placed' && clipSpanOf(video) !== null;

export const useActStudioTakes = (screen: StudioWorkScreen): ActStudioTakes => {
  const { playback, studio, video, mode } = screen;
  const work = screen.document;
  const { player, length, parts, steps } = playback;
  const [chosenId, setChosenId] = useState<number | null>(null);
  const onVideo = mode.editing && mode.tool === 'video';
  const desk = useSheetTarget(
    studio.videos.map((candidate) => candidate.videoId),
    onVideo,
    STUDIO_VIDEO_GONE,
  );
  const shareOf = (seconds: number): number => (length <= 0 ? 0 : seconds / length);
  const placed = studio.videos.filter(placedOf);
  const nameOf = (candidate: StudioVideo): string =>
    videoNameOf(candidate.name, videoNumberOf(studio.videos, candidate.videoId));
  const selected =
    studio.videos.find((candidate) => candidate.videoId === desk.targetId) ??
    studio.videos.find((candidate) => candidate.videoId === chosenId) ??
    placed.find((candidate) => candidate.videoId === video.shownId) ??
    placed[0] ??
    null;
  const placeAt = (candidate: StudioVideo, start: number): void => {
    const clip = clipOf(candidate);
    if (clip !== null) {
      work.change({
        kind: 'videoStart',
        videoId: candidate.videoId,
        startSeconds: clampedVideoStartOf(start, clip, length),
      });
    }
  };
  const selectedSpan = selected === null ? null : clipSpanOf(selected);
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
    bars: placed.map((candidate) => {
      const span = clipSpanOf(candidate);
      const start = span?.start ?? 0;
      const end = span?.end ?? 0;
      return {
        key: String(candidate.videoId),
        start: shareOf(start),
        end: shareOf(end),
        startSeconds: start,
        endSeconds: end,
        title: nameOf(candidate),
        meta: takeMetaOf(span),
        selected: candidate.videoId === selected?.videoId,
        choose: () => {
          setChosenId(candidate.videoId);
        },
        moveTo: (seconds) => {
          setChosenId(candidate.videoId);
          work.startGesture();
          placeAt(candidate, seconds - candidate.clipStartSeconds);
        },
        finish: () => {
          work.endGesture();
        },
      };
    }),
    text:
      selectedSpan === null || selected === null
        ? STUDIO_NO_VIDEO_HERE
        : placementTextOf(nameOf(selected), selectedSpan.start),
    canNudge: selected !== null && placedOf(selected),
    nudge: (direction) => {
      if (selected === null || selected.startSeconds === null) {
        return;
      }
      const delta = direction === 'later' ? NUDGE_SECONDS : -NUDGE_SECONDS;
      placeAt(selected, selected.startSeconds + delta);
    },
    groups: takeGroupsOf(parts, steps, placed).map(({ part, range, takes }) => {
      const groupKey = part === null ? LOOSE_GROUP_KEY : String(part.partId);

      return {
        key: groupKey,
        name: takeGroupNameOf(part?.name ?? null, parts.length > 0),
        aside: takes.length === 0 ? STUDIO_NO_VIDEO_HERE : null,
        rows: takes.map((candidate, index) => {
          const main = part !== null && candidate.videoId === part.mainVideoId;
          const isSelected = candidate.videoId === selected?.videoId;
          const badge = takeBadgeOf(candidate.outdated, part === null ? null : main);
          return {
            key: `${groupKey}-${candidate.videoId}`,
            lead: String(index + 1),
            title: nameOf(candidate),
            meta: takeMetaOf(clipSpanOf(candidate)),
            badge: isSelected && onVideo ? STUDIO_EDIT : badge,
            badgeTone: candidate.outdated ? 'gold' : main || isSelected ? 'ink' : 'quiet',
            selected: isSelected,
            press: () => {
              pressRow(candidate, Math.max(range?.start ?? 0, clipSpanOf(candidate)?.start ?? 0));
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
    openDesk: () => {
      if (selected !== null) {
        desk.open(selected.videoId);
      }
    },
    closeDesk: desk.close,
  };
};

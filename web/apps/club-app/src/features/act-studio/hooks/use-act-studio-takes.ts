import { STUDIO_EDIT } from '@furria/studio/studio-mode-copy';
import type { StudioVideo } from '@furria/studio/studio-schemas';
import type { KkStudioListBadgeTone } from '@furria/ui/KkStudioList';
import { useState } from 'react';
import {
  placementTextOf,
  STUDIO_NO_VIDEO_HERE,
  STUDIO_VIDEO_GONE,
  shelfMetaOf,
  takeBadgeOf,
  takeGroupNameOf,
  takeMetaOf,
  videoNameOf,
} from '../studio-copy';
import { clampedVideoStartOf, takeGroupsOf, videoShelfOf } from '../studio-videos';
import { useDeskTarget } from './use-desk-target';
import type { StudioScreen } from './use-studio-screen';

const NUDGE_SECONDS = 0.1;
const LOOSE_GROUP_KEY = 'loose';

export type VideoNudgeDirection = 'earlier' | 'later';

export interface ActStudioVideoBar {
  key: string;
  start: number;
  end: number;
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
  closeDesk: () => void;
}

const placedOf = (video: StudioVideo): boolean =>
  videoShelfOf(video) === 'placed' && video.durationSeconds !== null;

export const useActStudioTakes = (screen: StudioScreen): ActStudioTakes => {
  const { playback, studio, video, mode } = screen;
  const work = screen.document;
  const { player, length, parts, steps } = playback;
  const [chosenId, setChosenId] = useState<number | null>(null);
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
  const placeAt = (candidate: StudioVideo, start: number): void => {
    work.change({
      kind: 'videoStart',
      videoId: candidate.videoId,
      startSeconds: clampedVideoStartOf(start, candidate.durationSeconds ?? 0, length),
    });
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
    bars: placed.map((candidate) => {
      const start = candidate.startSeconds ?? 0;
      return {
        key: String(candidate.videoId),
        start: shareOf(start),
        end: shareOf(start + (candidate.durationSeconds ?? 0)),
        selected: candidate.videoId === selected?.videoId,
        choose: () => {
          setChosenId(candidate.videoId);
        },
        moveTo: (seconds) => {
          setChosenId(candidate.videoId);
          work.startGesture();
          placeAt(candidate, seconds);
        },
        finish: () => {
          work.endGesture();
        },
      };
    }),
    text:
      selected === null || selected.startSeconds === null
        ? STUDIO_NO_VIDEO_HERE
        : placementTextOf(nameOf(selected), selected.startSeconds),
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

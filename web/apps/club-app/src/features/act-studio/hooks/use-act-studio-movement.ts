import { useRef } from 'react';
import type {
  KeyframeEasing,
  SpotPath,
  StagePoint,
  TimedKeyframe,
} from '@/features/act-player/choreography-motion';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { viewShareOf } from '@/features/act-practice/practice-stage';
import type { StageShare, TimeSpan } from '../studio-edits';
import { draggedPointOf, snappedOf } from '../studio-edits';
import { formationAt } from '../studio-formation';
import {
  bendHandleOf,
  bentMoveOf,
  easedMoveOf,
  facedMoveOf,
  keyedTrackOf,
  keyIndexAt,
  moveIndexNear,
  retimedMoveOf,
  sameTrack,
  stagePointOfShare,
  straightenedMoveOf,
  turnedOf,
  unkeyedTrackOf,
} from '../studio-movement';
import type { StudioScreen } from './use-studio-screen';
import type { StudioTracks, TrackCommit } from './use-track-commit';

const AT_PLAYHEAD_SECONDS = 0.02;
const NONE = -1;

export interface ActStudioBendHandle {
  spotId: number;
  x: number;
  y: number;
}

export interface ActStudioMove {
  fromSeconds: number;
  toSeconds: number;
  easing: KeyframeEasing;
  bent: boolean;
  facingDegrees: number | null;
}

export interface ActStudioMovement {
  span: TimeSpan;
  movedSpots: number;
  lead: ActStudioMove | null;
  keyed: boolean;
  handles: ActStudioBendHandle[];
  grab: (spotIds: readonly number[], share: StageShare) => void;
  drag: (share: StageShare) => void;
  release: () => void;
  bendPress: (spotId: number) => void;
  bendMove: (share: StageShare) => void;
  bendEnd: () => void;
  retime: (target: TimeSpan) => void;
  ease: (easing: KeyframeEasing) => void;
  straighten: () => void;
  turn: (delta: number) => void;
  unface: () => void;
  unkey: () => void;
}

interface Grab {
  spotIds: readonly number[];
  start: StageShare;
  seconds: number | null;
  origins: ReadonlyMap<number, StagePoint>;
  tracks: StudioTracks;
  placed: StudioTracks | null;
}

interface Bend {
  spotId: number;
  index: number;
  keyframes: readonly TimedKeyframe[];
  placed: StudioTracks | null;
}

interface MoveAt {
  spotId: number;
  move: number | null;
  key: number | null;
}

const codeOf = (index: number | null): string => String(index ?? NONE);

const indexOf = (code: string | undefined): number | null => {
  if (code === undefined || code === '') {
    return null;
  }
  const value = Number(code);
  return value === NONE ? null : value;
};

const waypointIndexAt = (
  keyframes: readonly TimedKeyframe[],
  span: TimeSpan,
  now: number,
): number | null =>
  Math.abs(now - span.start) <= AT_PLAYHEAD_SECONDS
    ? null
    : keyIndexAt(keyframes, now, AT_PLAYHEAD_SECONDS);

export const useActStudioMovement = (
  screen: StudioScreen,
  selected: readonly number[],
  { preview, commit }: TrackCommit,
): ActStudioMovement => {
  const { playback, practice, mode } = screen;
  const { player, paths, stage, countMarks, controls, length } = playback;
  const grabbed = useRef<Grab | null>(null);
  const bending = useRef<Bend | null>(null);
  const step = practice.step;
  const span: TimeSpan = { start: step?.startSeconds ?? 0, end: step?.endSeconds ?? length };
  const chosen = paths.filter((path) => selected.includes(path.spotId));
  const code = usePlaybackSelection(player, (now) =>
    chosen
      .map(
        (path) =>
          `${codeOf(moveIndexNear(path.keyframes, span, now))}:${codeOf(waypointIndexAt(path.keyframes, span, now))}`,
      )
      .join(','),
  );
  const codes = code === '' ? [] : code.split(',');
  const moves: MoveAt[] = chosen.map((path, at) => {
    const [move, key] = (codes[at] ?? '').split(':');
    return { spotId: path.spotId, move: indexOf(move), key: indexOf(key) };
  });
  const pathOf = (spotId: number): SpotPath | null =>
    paths.find((path) => path.spotId === spotId) ?? null;
  const leadAt = moves.find((entry) => entry.move !== null) ?? null;
  const leadPath = leadAt === null ? null : pathOf(leadAt.spotId);
  const leadFrom =
    leadAt?.move === null || leadAt === null ? null : leadPath?.keyframes[leadAt.move];
  const leadTo =
    leadAt?.move === null || leadAt === null ? null : leadPath?.keyframes[leadAt.move + 1];

  const changed = (
    change: (keyframes: readonly TimedKeyframe[], entry: MoveAt) => readonly TimedKeyframe[] | null,
  ): void => {
    const tracks: StudioTracks = {};
    for (const entry of moves) {
      const path = pathOf(entry.spotId);
      const next = path === null ? null : change(path.keyframes, entry);
      if (next !== null && path !== null && !sameTrack(next, path.keyframes)) {
        tracks[entry.spotId] = next;
      }
    }
    commit(tracks);
  };

  const onMove = (
    change: (keyframes: readonly TimedKeyframe[], index: number) => readonly TimedKeyframe[],
  ): void => {
    changed((keyframes, entry) => (entry.move === null ? null : change(keyframes, entry.move)));
  };

  const settledGrab = (held: Grab): Grab => {
    if (held.seconds !== null) {
      return held;
    }
    if (player.state().playing) {
      controls.toggle();
    }
    const seconds =
      countMarks.length === 0 ? player.position() : snappedOf(countMarks, player.position());
    player.seek(seconds);
    const formation = formationAt(paths, seconds);
    const origins = new Map<number, StagePoint>();
    const tracks: StudioTracks = {};
    for (const spotId of held.spotIds) {
      const point = formation.get(spotId);
      const path = pathOf(spotId);
      if (point !== undefined && path !== null) {
        origins.set(spotId, point);
        tracks[spotId] = path.keyframes;
      }
    }
    const settled = { ...held, seconds, origins, tracks };
    grabbed.current = settled;
    return settled;
  };

  return {
    span,
    movedSpots: chosen.length,
    lead:
      leadFrom === null || leadFrom === undefined || leadTo === null || leadTo === undefined
        ? null
        : {
            fromSeconds: leadFrom.seconds,
            toSeconds: leadTo.seconds,
            easing: leadTo.easing,
            bent: leadTo.bend !== null,
            facingDegrees: leadTo.facingDegrees,
          },
    keyed: moves.some((entry) => entry.key !== null),
    handles:
      mode.tool !== 'movement'
        ? []
        : moves.flatMap((entry) => {
            const path = pathOf(entry.spotId);
            const point =
              entry.move === null || path === null
                ? null
                : bendHandleOf(path.keyframes, entry.move);
            if (point === null) {
              return [];
            }
            const share = viewShareOf(point, stage);
            return [{ spotId: entry.spotId, x: share.x, y: share.y }];
          }),
    grab: (spotIds, share) => {
      grabbed.current = {
        spotIds,
        start: share,
        seconds: null,
        origins: new Map(),
        tracks: {},
        placed: null,
      };
    },
    drag: (share) => {
      const held = grabbed.current;
      if (held === null) {
        return;
      }
      const settled = settledGrab(held);
      const seconds = settled.seconds ?? 0;
      const delta = { x: share.x - settled.start.x, y: share.y - settled.start.y };
      const tracks: StudioTracks = {};
      for (const [spotId, origin] of settled.origins) {
        tracks[spotId] = keyedTrackOf(
          settled.tracks[spotId] ?? [],
          seconds,
          draggedPointOf(origin, delta, stage),
        );
      }
      settled.placed = tracks;
      preview(tracks);
    },
    release: () => {
      const held = grabbed.current;
      grabbed.current = null;
      if (held?.placed) {
        commit(held.placed);
      }
    },
    bendPress: (spotId) => {
      const entry = moves.find((candidate) => candidate.spotId === spotId);
      const path = pathOf(spotId);
      if (entry?.move === null || entry === undefined || path === null) {
        return;
      }
      if (player.state().playing) {
        controls.toggle();
      }
      bending.current = { spotId, index: entry.move, keyframes: path.keyframes, placed: null };
    },
    bendMove: (share) => {
      const held = bending.current;
      if (held === null) {
        return;
      }
      held.placed = {
        [held.spotId]: bentMoveOf(
          held.keyframes,
          held.index,
          stagePointOfShare(share, stage),
          stage,
        ),
      };
      preview(held.placed);
    },
    bendEnd: () => {
      const held = bending.current;
      bending.current = null;
      if (held?.placed) {
        commit(held.placed);
      }
    },
    retime: (target) => {
      onMove((keyframes, index) => retimedMoveOf(keyframes, index, target));
      player.seek(target.start);
    },
    ease: (easing) => {
      onMove((keyframes, index) => easedMoveOf(keyframes, index, easing));
    },
    straighten: () => {
      onMove((keyframes, index) => straightenedMoveOf(keyframes, index));
    },
    turn: (delta) => {
      const facing = turnedOf(leadTo?.facingDegrees ?? null, delta);
      onMove((keyframes, index) => facedMoveOf(keyframes, index, facing));
    },
    unface: () => {
      onMove((keyframes, index) => facedMoveOf(keyframes, index, null));
    },
    unkey: () => {
      changed((keyframes, entry) =>
        entry.key === null ? null : unkeyedTrackOf(keyframes, entry.key),
      );
    },
  };
};

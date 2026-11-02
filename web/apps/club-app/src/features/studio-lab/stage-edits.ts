import type { SpotPath, StagePoint, TimedKeyframe } from '@furria/studio/choreography-motion';
import { pointOnMove, poseAt } from '@furria/studio/choreography-motion';

export const KEY_TOLERANCE_SECONDS = 0.05;
export const MIN_KEY_GAP_SECONDS = 0.1;
const LINE_SPACING_METRES = 1;
const KEY_GROUP_DECIMALS = 2;

export interface SpotMove {
  spotId: number;
  fromIndex: number;
  toIndex: number;
  from: TimedKeyframe;
  to: TimedKeyframe;
}

export interface KeyGroup {
  key: string;
  seconds: number;
  members: readonly { spotId: number; index: number }[];
}

const keyframeAt = (path: SpotPath, seconds: number): number =>
  path.keyframes.findIndex(
    (keyframe) => Math.abs(keyframe.seconds - seconds) <= KEY_TOLERANCE_SECONDS,
  );

const withPositionAt = (path: SpotPath, seconds: number, position: StagePoint): SpotPath => {
  const index = keyframeAt(path, seconds);
  if (index >= 0) {
    return {
      ...path,
      keyframes: path.keyframes.map((keyframe, at) =>
        at === index ? { ...keyframe, position } : keyframe,
      ),
    };
  }
  const facingDegrees = poseAt(path, seconds)?.facingDegrees ?? null;
  const added: TimedKeyframe = {
    seconds,
    position,
    bend: null,
    easing: 'easeInOut',
    facingDegrees,
  };

  return {
    ...path,
    keyframes: [...path.keyframes, added].sort((left, right) => left.seconds - right.seconds),
  };
};

export const withSpotsPlaced = (
  paths: readonly SpotPath[],
  seconds: number,
  places: ReadonlyMap<number, StagePoint>,
): SpotPath[] => {
  const known = new Set(paths.map((path) => path.spotId));
  const added = [...places.keys()]
    .filter((spotId) => !known.has(spotId))
    .map((spotId) => ({ spotId, keyframes: [] }));

  return [...paths, ...added].map((path) => {
    const position = places.get(path.spotId);

    return position === undefined ? path : withPositionAt(path, seconds, position);
  });
};

export const moveAt = (path: SpotPath, seconds: number): SpotMove | null => {
  const count = path.keyframes.length;
  if (count < 2) {
    return null;
  }
  const next = path.keyframes.findIndex(
    (keyframe) => keyframe.seconds > seconds + KEY_TOLERANCE_SECONDS,
  );
  const toIndex = next <= 0 ? (next === 0 ? 1 : count - 1) : next;
  const from = path.keyframes[toIndex - 1];
  const to = path.keyframes[toIndex];

  return from === undefined || to === undefined
    ? null
    : { spotId: path.spotId, fromIndex: toIndex - 1, toIndex, from, to };
};

export const bendPointOf = (move: SpotMove): StagePoint =>
  move.to.bend ?? pointOnMove(move.from.position, move.to.position, null, 0.5);

export const withBend = (
  paths: readonly SpotPath[],
  spotId: number,
  keyIndex: number,
  bend: StagePoint,
): SpotPath[] =>
  paths.map((path) =>
    path.spotId !== spotId
      ? path
      : {
          ...path,
          keyframes: path.keyframes.map((keyframe, index) =>
            index === keyIndex ? { ...keyframe, bend } : keyframe,
          ),
        },
  );

export const keyGroupsOf = (
  paths: readonly SpotPath[],
  spotIds: ReadonlySet<number>,
): KeyGroup[] => {
  const groups = new Map<
    string,
    { seconds: number; members: { spotId: number; index: number }[] }
  >();
  for (const path of paths) {
    if (spotIds.size === 0 || spotIds.has(path.spotId)) {
      path.keyframes.forEach((keyframe, index) => {
        const key = keyframe.seconds.toFixed(KEY_GROUP_DECIMALS);
        const group = groups.get(key) ?? { seconds: keyframe.seconds, members: [] };
        group.members.push({ spotId: path.spotId, index });
        groups.set(key, group);
      });
    }
  }

  return [...groups.entries()]
    .map(([key, group]) => ({ key, seconds: group.seconds, members: group.members }))
    .sort((left, right) => left.seconds - right.seconds);
};

const retimeRoomOf = (
  paths: readonly SpotPath[],
  group: KeyGroup,
): { lower: number; upper: number } => {
  let lower = Number.NEGATIVE_INFINITY;
  let upper = Number.POSITIVE_INFINITY;
  for (const member of group.members) {
    const keyframes = paths.find((path) => path.spotId === member.spotId)?.keyframes ?? [];
    const current = keyframes[member.index];
    const before = keyframes[member.index - 1];
    const after = keyframes[member.index + 1];
    if (current !== undefined && before !== undefined) {
      lower = Math.max(lower, before.seconds + MIN_KEY_GAP_SECONDS - current.seconds);
    }
    if (current !== undefined && after !== undefined) {
      upper = Math.min(upper, after.seconds - MIN_KEY_GAP_SECONDS - current.seconds);
    }
  }

  return { lower, upper };
};

export const withGroupRetimed = (
  paths: readonly SpotPath[],
  group: KeyGroup,
  seconds: number,
): SpotPath[] => {
  const room = retimeRoomOf(paths, group);
  const delta = Math.min(
    Math.max(seconds - group.seconds, room.lower),
    Math.max(room.lower, room.upper),
  );

  return paths.map((path) => {
    const indices = new Set(
      group.members.filter((member) => member.spotId === path.spotId).map((member) => member.index),
    );

    return indices.size === 0
      ? path
      : {
          ...path,
          keyframes: path.keyframes.map((keyframe, index) =>
            indices.has(index) ? { ...keyframe, seconds: keyframe.seconds + delta } : keyframe,
          ),
        };
  });
};

export const mirroredPlaces = (
  positions: ReadonlyMap<number, StagePoint>,
): Map<number, StagePoint> =>
  new Map(
    [...positions.entries()].map(([spotId, point]) => [
      spotId,
      { rightMetres: -point.rightMetres, backMetres: point.backMetres },
    ]),
  );

export const linedUpPlaces = (
  positions: ReadonlyMap<number, StagePoint>,
): Map<number, StagePoint> => {
  const entries = [...positions.entries()].sort(
    ([, left], [, right]) => left.rightMetres - right.rightMetres,
  );
  const back =
    entries.reduce((sum, [, point]) => sum + point.backMetres, 0) / Math.max(entries.length, 1);
  const centre =
    entries.reduce((sum, [, point]) => sum + point.rightMetres, 0) / Math.max(entries.length, 1);
  const first = centre - ((entries.length - 1) * LINE_SPACING_METRES) / 2;

  return new Map(
    entries.map(([spotId], index) => [
      spotId,
      { rightMetres: first + index * LINE_SPACING_METRES, backMetres: back },
    ]),
  );
};

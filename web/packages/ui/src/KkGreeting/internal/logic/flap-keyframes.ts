import type { SplitFlapPose } from '../../../internal/flap/flap-pose';
import { FLAT_PROGRESS, flapPoseAt } from '../../../internal/flap/flap-pose';
import { ramp } from '../../../internal/ramp';
import { kkTokens } from '../../../tokens';
import type { FlapFlip, FlapRun, FlapSchedule } from './flap-schedule';

interface FlapPoseKey {
  fall: number;
  land: number;
  cover: number;
  presence: number;
  face: number;
}

export interface FlapTrack {
  cell: number;
  at: number[];
  fall: number[];
  land: number[];
  cover: number[];
  presence: number[];
  face: number[];
}

interface TimedKey extends FlapPoseKey {
  at: number;
}

type Envelope = 'rise' | 'hold' | 'fade' | 'whole';

const { finalMs, reboundDeg } = kkTokens.motion.flap;

const RIGHT_ANGLE = 90;
const HALF = 0.5;
const FINAL_FALL_MS = 80;
const FALL_SAMPLES = 6;
const LAND_SAMPLES = 10;
const REBOUND_SAMPLES = 6;
const SNAP_MS = 1;
const PRECISION = 1000;
const LAST_REBOUND_SHARE = 0.5;

const settled = (value: number): number => Math.round(value * PRECISION) / PRECISION + 0;

const sampled = (count: number): number[] =>
  Array.from({ length: count + 1 }, (_, index) => index / count);

const opensOn = (envelope: Envelope): boolean => envelope === 'whole' || envelope === 'rise';

const closesOn = (envelope: Envelope): boolean => envelope === 'whole' || envelope === 'fade';

const presenceOf = (pose: SplitFlapPose, progress: number, envelope: Envelope): number => {
  if (progress < HALF) {
    return opensOn(envelope) ? pose.presence : 1;
  }

  return closesOn(envelope) ? 1 - ramp(progress, FLAT_PROGRESS, 1) : 1;
};

const keyOf = (
  at: number,
  progress: number,
  face: number,
  envelope: Envelope,
  rebounds: boolean,
): TimedKey => {
  const pose = flapPoseAt(progress);
  const liesFlat = !rebounds && closesOn(envelope) && progress >= FLAT_PROGRESS;

  return {
    at,
    fall: pose.fall,
    land: liesFlat ? 0 : pose.land,
    cover: pose.cover,
    presence: presenceOf(pose, progress, envelope),
    face,
  };
};

const FINAL_LAND_MS = finalMs - FINAL_FALL_MS;

const fallMsOf = (flip: FlapFlip): number =>
  flip.kind === 'face' ? flip.duration * HALF : FINAL_FALL_MS;

const landMsOf = (flip: FlapFlip): number =>
  flip.kind === 'face' ? flip.duration * HALF : FINAL_LAND_MS;

const reboundKeysOf = (at: number, duration: number, face: number): TimedKey[] =>
  sampled(REBOUND_SAMPLES).map((share) => ({
    at: at + share * duration,
    fall: -RIGHT_ANGLE,
    land: reboundDeg * LAST_REBOUND_SHARE * Math.sin(Math.PI * share),
    cover: 1,
    presence: 0,
    face,
  }));

const turnKeysOf = (flip: FlapFlip, at: number, face: number, envelope: Envelope): TimedKey[] => {
  const fallMs = fallMsOf(flip);
  const landMs = landMsOf(flip);
  const rebounds = flip.kind === 'strike';
  const falling = sampled(FALL_SAMPLES).map((share) =>
    keyOf(at + share * fallMs, share * HALF, face, envelope, rebounds),
  );
  const landing = sampled(LAND_SAMPLES)
    .slice(1)
    .map((share) =>
      keyOf(at + fallMs + share * landMs, HALF + share * HALF, face, envelope, rebounds),
    );
  const turned = [...falling, ...landing];

  if (flip.kind !== 'strike') {
    return turned;
  }

  const reboundAt = at + fallMs + landMs;

  return [...turned, ...reboundKeysOf(reboundAt, flip.duration - fallMs - landMs, face).slice(1)];
};

const envelopeOf = (index: number, count: number, standing: boolean): Envelope => {
  if (index === count - 1) {
    return count === 1 && !standing ? 'whole' : 'fade';
  }
  if (index === 0 && !standing) {
    return 'rise';
  }

  return 'hold';
};

const strictlyTimed = (keys: readonly TimedKey[]): TimedKey[] => {
  const timed: TimedKey[] = [];

  for (const key of keys) {
    const previous = timed.at(-1);
    const at = previous === undefined ? key.at : Math.max(key.at, previous.at + SNAP_MS);

    timed.push({ ...key, at });
  }

  return timed;
};

const restingKeyOf = (at: number, face: number, presence: number): TimedKey => ({
  at,
  fall: -RIGHT_ANGLE,
  land: 0,
  cover: 1,
  presence,
  face,
});

const standingKeysOf = (lead: number): TimedKey[] =>
  lead > 0 ? [{ ...keyOf(0, 0, 0, 'hold', false), presence: 1 }] : [];

const runKeysOf = (run: FlapRun, assembled: boolean): TimedKey[] => {
  const count = run.flips.length;
  const lead = assembled ? run.start : 0;
  const standing = assembled;

  const keys = run.flips.flatMap((flip, index) => {
    const at = flip.at - run.start + lead;
    const turn = turnKeysOf(flip, at, index, envelopeOf(index, count, standing));

    return index === 0 ? turn : [restingKeyOf(at, index - 1, 1), ...turn];
  });

  return strictlyTimed([...standingKeysOf(lead), ...keys]);
};

const trackOf = (run: FlapRun, assembled: boolean): FlapTrack => {
  const delay = assembled ? 0 : run.start;
  const keys = runKeysOf(run, assembled);

  return {
    cell: run.cell,
    at: keys.map((key) => delay + key.at),
    fall: keys.map((key) => settled(key.fall)),
    land: keys.map((key) => settled(key.land)),
    cover: keys.map((key) => settled(key.cover)),
    presence: keys.map((key) => settled(key.presence)),
    face: keys.map((key) => key.face),
  };
};

export const flapKeyframesOf = (schedule: FlapSchedule, assembled = false): FlapTrack[] =>
  schedule.runs.map((run) => trackOf(run, assembled));

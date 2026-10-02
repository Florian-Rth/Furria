import type { SplitFlapPose } from '../../../internal/flap/flap-pose';
import { flapPoseAt } from '../../../internal/flap/flap-pose';
import { kkTokens } from '../../../tokens';
import type { FlapFlip, FlapSchedule, FlapTurnRun } from './flap-schedule';
import { isTurnRun } from './flap-schedule';

interface FlapPoseKey {
  fall: number;
  land: number;
  cover: number;
  presence: number;
  face: number;
}

export interface FlapTrack {
  cell: number;
  delay: number;
  duration: number;
  times: number[];
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
const TICK_SAMPLES = 8;
const PRESENCE_GAIN = 2.4;
const SNAP_MS = 1;
const PRECISION = 1000;
const LAST_REBOUND_SHARE = 0.5;
const ASSEMBLE_MS = 120;

const settled = (value: number): number => Math.round(value * PRECISION) / PRECISION + 0;

const sampled = (count: number): number[] =>
  Array.from({ length: count + 1 }, (_, index) => index / count);

const presenceOf = (pose: SplitFlapPose, progress: number, envelope: Envelope): number => {
  if (envelope === 'whole') {
    return pose.presence;
  }
  if (envelope === 'rise') {
    return progress < HALF ? pose.presence : 1;
  }
  if (envelope === 'fade') {
    return progress < HALF ? 1 : pose.presence;
  }

  return 1;
};

const keyOf = (at: number, progress: number, face: number, envelope: Envelope): TimedKey => {
  const pose = flapPoseAt(progress);

  return {
    at,
    fall: pose.fall,
    land: pose.land,
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

const tickKeysOf = (at: number, duration: number, face: number): TimedKey[] =>
  sampled(TICK_SAMPLES).map((share) => {
    const swing = Math.sin(Math.PI * share);

    return {
      at: at + share * duration,
      fall: -RIGHT_ANGLE * swing,
      land: RIGHT_ANGLE,
      cover: 0,
      presence: Math.min(swing * PRESENCE_GAIN, 1),
      face,
    };
  });

const turnKeysOf = (flip: FlapFlip, at: number, face: number, envelope: Envelope): TimedKey[] => {
  const fallMs = fallMsOf(flip);
  const landMs = landMsOf(flip);
  const falling = sampled(FALL_SAMPLES).map((share) =>
    keyOf(at + share * fallMs, share * HALF, face, envelope),
  );
  const landing = sampled(LAND_SAMPLES)
    .slice(1)
    .map((share) => keyOf(at + fallMs + share * landMs, HALF + share * HALF, face, envelope));
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

const waitingKeyOf = (at: number, presence: number): TimedKey => ({
  ...keyOf(at, 0, 0, 'hold'),
  presence,
});

const assemblyKeysOf = (lead: number): TimedKey[] =>
  lead > 0 ? [waitingKeyOf(0, 0), waitingKeyOf(Math.min(ASSEMBLE_MS, lead), 1)] : [];

const runKeysOf = (run: FlapTurnRun, assembled: boolean): TimedKey[] => {
  const count = run.flips.length;
  const lead = assembled ? run.start : 0;
  const standing = lead > 0;

  const keys = run.flips.flatMap((flip, index) => {
    const at = flip.at - run.start + lead;

    if (flip.kind === 'tick') {
      return tickKeysOf(at, flip.duration, index);
    }

    const turn = turnKeysOf(flip, at, index, envelopeOf(index, count, standing));

    return index === 0 ? turn : [restingKeyOf(at, index - 1, 1), ...turn];
  });

  return strictlyTimed([...assemblyKeysOf(lead), ...keys]);
};

const trackOf = (run: FlapTurnRun, assembled: boolean): FlapTrack => {
  const keys = runKeysOf(run, assembled);
  const duration = keys.at(-1)?.at ?? 0;

  return {
    cell: run.cell,
    delay: assembled ? 0 : run.start,
    duration,
    times: keys.map((key) => (duration === 0 ? 0 : key.at / duration)),
    fall: keys.map((key) => settled(key.fall)),
    land: keys.map((key) => settled(key.land)),
    cover: keys.map((key) => settled(key.cover)),
    presence: keys.map((key) => settled(key.presence)),
    face: keys.map((key) => key.face),
  };
};

export const flapKeyframesOf = (schedule: FlapSchedule, assembled = false): FlapTrack[] =>
  schedule.runs.filter(isTurnRun).map((run) => trackOf(run, assembled && run.motion === 'flap'));

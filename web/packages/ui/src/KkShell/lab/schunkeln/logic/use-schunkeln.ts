import type { MotionValue } from 'motion/react';
import { useAnimationFrame, useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import type { RefObject } from 'react';
import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { kkTokens } from '../../../../tokens';
import { measureRestGlyphs, measureSchunkelPlan } from './measure-schunkel';
import { DIP_MILLISECONDS, flipCase, RIPPLE_MILLISECONDS } from './schunkel-flip';
import {
  handoverProgressAt,
  letterPoseAt,
  lowerDueAt,
  lowerMixOf,
  ramp,
  restPoseAt,
  swapsCase,
} from './schunkel-pose';
import type { SwayKick, SwayState } from './schunkel-sway';
import {
  applyDueKick,
  kicksOf,
  kickVelocityOf,
  SWAY_UPRIGHT,
  swayResting,
  swayStep,
  waveTargetAt,
} from './schunkel-sway';
import type { SchunkelScene } from './schunkel-values';
import { EMPTY_SCENE, sceneOf } from './schunkel-values';

const TRAVEL = kkTokens.shell.scrollTravel;
const SCROLL_GATE_MILLISECONDS = 110;
const TITLE_REACH = 11;
const REST_REACH = 13;
const DOCK_TILT = -13;
const RETURN_TILT = 7;
const KICK_LAG_MILLISECONDS = 55;
const REST_SHARE = 0.5;
const PLAIN_TITLE_FROM = 0.55;

interface SchunkelMotion {
  progress: number;
  lastScrollAt: number;
  lastTickAt: number;
  dipUntil: number;
  active: boolean;
  flying: boolean;
  lowered: boolean[];
  titleSway: SwayState[];
  titleKicks: (SwayKick | null)[];
  restSway: SwayState[];
  restKicks: (SwayKick | null)[];
}

export interface Schunkeln {
  slotRef: RefObject<HTMLDivElement | null>;
  restRef: RefObject<HTMLDivElement | null>;
  flightRef: RefObject<HTMLDivElement | null>;
  scene: SchunkelScene;
  titleOpacity: MotionValue<number>;
  flightOpacity: MotionValue<number>;
  restOpacity: MotionValue<number>;
}

const uprightRow = (count: number): SwayState[] =>
  Array.from({ length: count }, () => SWAY_UPRIGHT);

const idleKicks = (count: number): (SwayKick | null)[] => Array.from({ length: count }, () => null);

const settleRow = (
  sway: SwayState[],
  kicks: (SwayKick | null)[],
  targetOf: (index: number) => number,
  rotations: readonly MotionValue<number>[],
  now: number,
  seconds: number,
  scrolling: boolean,
): boolean => {
  let resting = true;

  rotations.forEach((rotate, index) => {
    const kicked = applyDueKick(sway.at(index) ?? SWAY_UPRIGHT, kicks.at(index) ?? null, now);
    const next = swayStep(kicked.state, targetOf(index), seconds);
    const still = !scrolling && kicked.kick === null && swayResting(next);

    sway[index] = still ? SWAY_UPRIGHT : next;
    kicks[index] = kicked.kick;
    rotate.set(sway[index].angle);
    resting = resting && still;
  });

  return resting;
};

export const useSchunkeln = (restText: string | null, titleText: string): Schunkeln => {
  const { scrollY } = useScroll();
  const slotRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const titleOpacity = useMotionValue(0);
  const flightOpacity = useMotionValue(0);
  const restOpacity = useMotionValue(1);
  const [scene, setScene] = useState<SchunkelScene>(EMPTY_SCENE);
  const sceneRef = useRef<SchunkelScene>(EMPTY_SCENE);
  const motionRef = useRef<SchunkelMotion>({
    progress: 0,
    lastScrollAt: 0,
    lastTickAt: 0,
    dipUntil: 0,
    active: false,
    flying: false,
    lowered: [],
    titleSway: [],
    titleKicks: [],
    restSway: [],
    restKicks: [],
  });

  const stage = (now: number, resting: boolean): void => {
    const motion = motionRef.current;
    const { plan } = sceneRef.current;
    const { progress } = motion;
    const travelling = progress > 0 && progress < 1;
    const flying = plan !== null && (travelling || !resting || now < motion.dipUntil);

    if (flying !== motion.flying) {
      motion.flying = flying;
      flightRef.current?.setAttribute('data-flying', String(flying));
    }

    flightOpacity.set(flying ? 1 : 0);

    if (plan === null) {
      titleOpacity.set(ramp(progress, PLAIN_TITLE_FROM, 1));
    } else {
      titleOpacity.set(progress >= 1 && !flying ? 1 : 0);
    }
  };

  const remeasure = (): void => {
    const motion = motionRef.current;
    const plan = measureSchunkelPlan(slotRef.current);
    const restGlyphs = restText === null ? [] : measureRestGlyphs(restRef.current);
    const restCount = restText === null ? 1 : restGlyphs.length;
    const previous = sceneRef.current;
    const next = sceneOf(plan, restGlyphs, restCount, previous);

    if (next.letters !== previous.letters) {
      motion.titleSway = uprightRow(next.letters.length);
      motion.titleKicks = idleKicks(next.letters.length);
      motion.lowered = next.letters.map((values, index) => {
        const letter = plan?.letters.at(index);
        const lowered = lowerDueAt(motion.progress);

        if (letter !== undefined) {
          values.lower.jump(lowerMixOf(letter, lowered));
        }

        return lowered;
      });
    }

    if (next.restLetters !== previous.restLetters) {
      motion.restSway = uprightRow(next.restLetters.length);
      motion.restKicks = idleKicks(next.restLetters.length);
    }

    sceneRef.current = next;
    setScene(next);
  };

  const place = (scrollOffset: number, quiet: boolean): void => {
    const motion = motionRef.current;
    const now = performance.now();
    const progress = handoverProgressAt(scrollOffset, TRAVEL);

    if (!quiet && progress > 0 && motion.progress <= 0) {
      remeasure();
    }

    const { plan, letters, restLetters } = sceneRef.current;
    const count = letters.length;

    letters.forEach((values, index) => {
      const letter = plan?.letters.at(index);

      if (plan === null || letter === undefined) {
        return;
      }

      const pose = letterPoseAt(letter, index, count, progress, scrollOffset, plan.dockScale);
      values.x.set(pose.x);
      values.y.set(pose.y);
      values.scale.set(pose.scale);
      values.presence.set(pose.presence);

      const due = lowerDueAt(progress);

      if (swapsCase(letter) && due !== motion.lowered.at(index)) {
        motion.lowered[index] = due;
        motion.dipUntil = now + DIP_MILLISECONDS + count * RIPPLE_MILLISECONDS;
        flipCase(values, due, index);
      }
    });

    restLetters.forEach((values, index) => {
      const pose = restPoseAt(progress, index, restLetters.length);
      values.x.set(pose.x);
      values.opacity.set(pose.opacity);
    });

    restOpacity.set(1 - ramp(progress, 0, REST_SHARE));

    if (!quiet && motion.progress < 1 && progress >= 1) {
      motion.titleKicks = kicksOf(count, now, KICK_LAG_MILLISECONDS, kickVelocityOf(DOCK_TILT));
    }

    if (!quiet && motion.progress > 0 && progress <= 0) {
      motion.titleKicks = kicksOf(count, now, KICK_LAG_MILLISECONDS, kickVelocityOf(RETURN_TILT));
      motion.restKicks = kicksOf(
        restLetters.length,
        now,
        KICK_LAG_MILLISECONDS,
        kickVelocityOf(RETURN_TILT),
      );
    }

    if (!motion.active) {
      motion.lastTickAt = now;
    }

    if (!quiet) {
      motion.lastScrollAt = now;
      motion.active = true;
    }

    motion.progress = progress;
    stage(now, !motion.active);
  };

  const tick = (): void => {
    const motion = motionRef.current;

    if (!motion.active) {
      return;
    }

    const now = performance.now();
    const seconds = (now - motion.lastTickAt) / 1000;
    const scrolling = now - motion.lastScrollAt < SCROLL_GATE_MILLISECONDS;
    const { progress } = motion;
    const restProgress = ramp(progress, 0, REST_SHARE);
    const { letters, restLetters } = sceneRef.current;

    motion.lastTickAt = now;

    const titleTarget = (index: number): number =>
      scrolling ? waveTargetAt(progress, index, TITLE_REACH) : 0;
    const restTarget = (index: number): number =>
      scrolling ? waveTargetAt(restProgress, index, REST_REACH) : 0;

    const titleResting = settleRow(
      motion.titleSway,
      motion.titleKicks,
      titleTarget,
      letters.map((values) => values.rotate),
      now,
      seconds,
      scrolling,
    );
    const restResting = settleRow(
      motion.restSway,
      motion.restKicks,
      restTarget,
      restLetters.map((values) => values.rotate),
      now,
      seconds,
      scrolling,
    );
    const resting = titleResting && restResting;

    stage(now, resting);

    if (resting && now >= motion.dipUntil) {
      motion.active = false;
    }
  };

  const follow = (scrollOffset: number): void => {
    place(scrollOffset, false);
  };

  const refresh = useEffectEvent((): void => {
    motionRef.current.progress = handoverProgressAt(window.scrollY, TRAVEL);
    remeasure();
    place(window.scrollY, true);
  });

  useMotionValueEvent(scrollY, 'change', follow);
  useAnimationFrame(tick);

  useLayoutEffect(() => {
    let alive = true;

    const onResize = (): void => {
      refresh();
    };

    refresh();
    window.addEventListener('resize', onResize);
    void document.fonts.ready.then(() => {
      if (alive) {
        refresh();
      }
    });

    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
    };
  }, [restText, titleText]);

  return { slotRef, restRef, flightRef, scene, titleOpacity, flightOpacity, restOpacity };
};

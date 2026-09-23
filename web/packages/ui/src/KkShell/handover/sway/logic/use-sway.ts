import type { MotionValue } from 'motion/react';
import { useAnimationFrame, useMotionValue, useMotionValueEvent } from 'motion/react';
import type { RefObject } from 'react';
import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { kkTokens } from '../../../../tokens';
import { useKkShellScroll } from '../../../internal/logic/shell-scroll';
import type { SwayKick, SwayState } from './letter-swing';
import {
  applyDueKick,
  kicksOf,
  kickVelocityOf,
  SWAY_UPRIGHT,
  swayResting,
  swayStep,
  waveTargetAt,
} from './letter-swing';
import { measureLineGlyphs, measureSwayPlan } from './measure-sway';
import { DIP_MILLISECONDS, flipCase, RIPPLE_MILLISECONDS } from './sway-flip';
import {
  arrivalPoseAt,
  handoverProgressAt,
  letterPoseAt,
  lowerDueAt,
  lowerMixOf,
  ramp,
  restPoseAt,
  swapsCase,
} from './sway-pose';
import type { SwayScene } from './sway-values';
import { EMPTY_SCENE, sceneOf, titleRowOf } from './sway-values';

const TRAVEL = kkTokens.shell.scrollTravel;
const SCROLL_GATE_MILLISECONDS = 110;
const TITLE_REACH = 11;
const REST_REACH = 13;
const DOCK_TILT = -13;
const RETURN_TILT = 7;
const KICK_LAG_MILLISECONDS = 55;
const REST_SHARE = 0.5;
const PLAIN_TITLE_FROM = 0.55;

interface SwayMotion {
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

export interface Sway {
  slotRef: RefObject<HTMLDivElement | null>;
  restRef: RefObject<HTMLDivElement | null>;
  flightRef: RefObject<HTMLDivElement | null>;
  scene: SwayScene;
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

export const useSway = (restText: string | null, titleText: string): Sway => {
  const { scrollY } = useKkShellScroll();
  const slotRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const titleOpacity = useMotionValue(0);
  const flightOpacity = useMotionValue(0);
  const restOpacity = useMotionValue(1);
  const [scene, setScene] = useState<SwayScene>(EMPTY_SCENE);
  const sceneRef = useRef<SwayScene>(EMPTY_SCENE);
  const motionRef = useRef<SwayMotion>({
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
    const { plan, arrivalLetters } = sceneRef.current;
    const { progress } = motion;
    const travelling = progress > 0 && progress < 1;
    const flying = plan !== null && (travelling || !resting || now < motion.dipUntil);

    if (flying !== motion.flying) {
      motion.flying = flying;
      flightRef.current?.setAttribute('data-flying', String(flying));
    }

    flightOpacity.set(flying ? 1 : 0);

    if (plan === null) {
      titleOpacity.set(arrivalLetters.length > 0 ? 1 : ramp(progress, PLAIN_TITLE_FROM, 1));
    } else {
      titleOpacity.set(progress >= 1 && !flying ? 1 : 0);
    }
  };

  const remeasure = (): void => {
    const motion = motionRef.current;
    const plan = measureSwayPlan(slotRef.current);
    const restGlyphs = restText === null ? [] : measureLineGlyphs(restRef.current);
    const restCount = restText === null ? 1 : restGlyphs.length;
    const previous = sceneRef.current;
    const arrivalGlyphs = plan === null ? measureLineGlyphs(slotRef.current) : [];
    const next = sceneOf(plan, restGlyphs, restCount, arrivalGlyphs, previous);

    if (next.letters !== previous.letters || next.arrivalLetters !== previous.arrivalLetters) {
      const titleCount = titleRowOf(next).length;
      motion.titleSway = uprightRow(titleCount);
      motion.titleKicks = idleKicks(titleCount);
    }

    if (next.letters !== previous.letters) {
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

    const scene = sceneRef.current;
    const { plan, letters, restLetters, arrivalLetters } = scene;
    const count = letters.length;
    const titleCount = titleRowOf(scene).length;

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

    arrivalLetters.forEach((values, index) => {
      const pose = arrivalPoseAt(progress, index, arrivalLetters.length);
      values.x.set(pose.x);
      values.opacity.set(pose.opacity);
    });

    restOpacity.set(1 - ramp(progress, 0, REST_SHARE));

    if (!quiet && motion.progress < 1 && progress >= 1) {
      motion.titleKicks = kicksOf(
        titleCount,
        now,
        KICK_LAG_MILLISECONDS,
        kickVelocityOf(DOCK_TILT),
      );
    }

    if (!quiet && motion.progress > 0 && progress <= 0) {
      motion.titleKicks = kicksOf(
        titleCount,
        now,
        KICK_LAG_MILLISECONDS,
        kickVelocityOf(RETURN_TILT),
      );
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
    const scene = sceneRef.current;

    motion.lastTickAt = now;

    const titleTarget = (index: number): number =>
      scrolling ? waveTargetAt(progress, index, TITLE_REACH) : 0;
    const restTarget = (index: number): number =>
      scrolling ? waveTargetAt(restProgress, index, REST_REACH) : 0;

    const titleResting = settleRow(
      motion.titleSway,
      motion.titleKicks,
      titleTarget,
      titleRowOf(scene),
      now,
      seconds,
      scrolling,
    );
    const restResting = settleRow(
      motion.restSway,
      motion.restKicks,
      restTarget,
      scene.restLetters.map((values) => values.rotate),
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
    motionRef.current.progress = handoverProgressAt(scrollY.get(), TRAVEL);
    remeasure();
    place(scrollY.get(), true);
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

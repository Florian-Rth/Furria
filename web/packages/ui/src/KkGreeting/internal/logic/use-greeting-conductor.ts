import type { AnimationPlaybackControls } from 'motion/react';
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useConfettiDock } from '../../../KkShell/handover/confetti/confetti-dock-context';
import { useScreenArrivalHold } from '../../../KkShell/internal/logic/screen-arrival';
import { useKkShellScroll } from '../../../KkShell/internal/logic/shell-scroll';
import { kkTokens } from '../../../tokens';
import type { FlapSchedule, KkGreetingPlay } from './flap-schedule';
import { sameSchedule } from './greeting-board';
import type { GreetingStage } from './greeting-context';
import type { GreetingPhase } from './greeting-cues';
import type { GreetingPoint } from './greeting-geometry';
import { landingAtOf } from './greeting-landing';
import { greetingStartOf, leavesRest } from './greeting-start';
import { burstOriginIn } from './measure-greeting';

export interface GreetingConductorProps {
  play: KkGreetingPlay;
  festive: boolean;
  burst: boolean;
  follows?: boolean;
}

export interface GreetingBurstShot {
  key: number;
  origin: GreetingPoint;
}

export interface GreetingConductor {
  stage: GreetingStage;
  shot: GreetingBurstShot | null;
}

const { startMs, hingeMs } = kkTokens.motion.greeting;

const MS_PER_SECOND = 1000;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const INPUT_INTERRUPTS = ['pointerdown', 'wheel', 'keydown', 'resize'] as const;
const LISTENING: AddEventListenerOptions = { capture: true, passive: true };

const isHidden = (): boolean => document.visibilityState === 'hidden';

const firstPhaseOf = (play: KkGreetingPlay, follows: boolean): GreetingPhase => {
  if (play === 'still') {
    return 'settled';
  }
  if (follows) {
    return isHidden() ? 'settled' : 'playing';
  }

  return 'waiting';
};

export const useGreetingConductor = ({
  play,
  festive,
  burst,
  follows = false,
}: GreetingConductorProps): GreetingConductor => {
  const burstDueRef = useRef(true);
  const runningRef = useRef<AnimationPlaybackControls | null>(null);
  const clock = useMotionValue(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<GreetingPhase>(() => firstPhaseOf(play, follows));
  const [stilled, setStilled] = useState(false);
  const [schedule, setSchedule] = useState<FlapSchedule | null>(null);
  const [shot, setShot] = useState<GreetingBurstShot | null>(null);
  const [landed, setLanded] = useState(false);
  const { scrollY } = useKkShellScroll();
  const dock = useConfettiDock();
  const burstAt = schedule?.burstAt ?? null;
  const landsAt = schedule === null ? null : landingAtOf(schedule);

  useScreenArrivalHold(phase !== 'settled' && !landed);

  const interrupt = (): void => {
    setPhase('settled');
  };

  const publish = (next: FlapSchedule): void => {
    setSchedule((current) => (sameSchedule(current, next) ? current : next));
  };

  const run = (duration: number): void => {
    if (phase !== 'playing' || runningRef.current !== null) {
      return;
    }

    runningRef.current = animate(clock, duration, {
      duration: duration / MS_PER_SECOND,
      ease: 'linear',
      onComplete: () => {
        setPhase('settled');
      },
    });
  };

  const isWaiting = useEffectEvent((): boolean => phase === 'waiting');

  const begin = useEffectEvent((waitedMs: number): void => {
    const start = greetingStartOf({
      waitedMs,
      hidden: isHidden(),
      reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
    });

    setStilled(start === 'still');
    setPhase((current) => {
      if (current !== 'waiting') {
        return current;
      }

      return start === 'play' ? 'playing' : 'settled';
    });
  });

  const fire = (): void => {
    burstDueRef.current = false;

    if (dock.isDocked()) {
      dock.replayLanding();

      return;
    }

    const origin = burstOriginIn(root);

    if (origin !== null) {
      setShot({ key: Date.now(), origin });
    }
  };

  useMotionValueEvent(clock, 'change', (elapsed: number): void => {
    if (!landed && landsAt !== null && elapsed >= landsAt) {
      setLanded(true);
    }
    if (burstDueRef.current && burstAt !== null && elapsed >= burstAt) {
      fire();
    }
  });

  useMotionValueEvent(scrollY, 'change', (offset: number): void => {
    if (leavesRest(scrollY.getPrevious() ?? offset, offset)) {
      setPhase('settled');
    }
  });

  useEffect(() => {
    if (!isWaiting()) {
      return;
    }

    const mountedAt = performance.now();
    let decided = false;
    let leadTimer = 0;

    const decide = (): void => {
      if (!decided) {
        decided = true;
        begin(performance.now() - mountedAt);
      }
    };

    const hingeTimer = window.setTimeout(decide, hingeMs);
    const lead = new Promise<void>((resolve) => {
      leadTimer = window.setTimeout(resolve, startMs);
    });

    if (isHidden()) {
      decide();
    }

    void Promise.all([document.fonts.ready, lead]).then(decide);

    return () => {
      decided = true;
      window.clearTimeout(hingeTimer);
      window.clearTimeout(leadTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    return () => {
      runningRef.current?.stop();
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'settled') {
      return;
    }

    const onInput = (): void => {
      setPhase('settled');
    };

    const onVisibility = (): void => {
      if (isHidden()) {
        setPhase('settled');
      }
    };

    for (const type of INPUT_INTERRUPTS) {
      window.addEventListener(type, onInput, LISTENING);
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      for (const type of INPUT_INTERRUPTS) {
        window.removeEventListener(type, onInput, LISTENING);
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [phase]);

  return {
    stage: {
      play: stilled ? 'still' : play,
      festive,
      burst,
      phase,
      schedule,
      clock,
      root,
      attach: setRoot,
      publish,
      run,
      interrupt,
    },
    shot,
  };
};

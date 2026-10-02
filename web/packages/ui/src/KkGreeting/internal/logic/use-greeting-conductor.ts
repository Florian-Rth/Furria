import { useMotionValueEvent } from 'motion/react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useConfettiDock } from '../../../KkShell/handover/confetti/confetti-dock-context';
import { useKkShellScroll } from '../../../KkShell/internal/logic/shell-scroll';
import { kkTokens } from '../../../tokens';
import type { KkGreetingPlay } from './flap-schedule';
import type { GreetingBoard } from './greeting-board';
import { sameBoard } from './greeting-board';
import type { GreetingStage } from './greeting-context';
import type { GreetingPhase } from './greeting-cues';
import type { GreetingPoint } from './greeting-geometry';
import { greetingStartOf, leavesRest } from './greeting-start';
import { burstOriginIn } from './measure-greeting';

export interface GreetingConductorProps {
  play: KkGreetingPlay;
  festive: boolean;
  night: boolean;
  burst: boolean;
  onSettled: (cells: string[]) => void;
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

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const INPUT_INTERRUPTS = ['pointerdown', 'wheel', 'keydown', 'resize'] as const;
const LISTENING: AddEventListenerOptions = { capture: true, passive: true };

const firstPhaseOf = (play: KkGreetingPlay): GreetingPhase =>
  play === 'still' ? 'settled' : 'waiting';

const isHidden = (): boolean => document.visibilityState === 'hidden';

export const useGreetingConductor = ({
  play,
  festive,
  night,
  burst,
  onSettled,
}: GreetingConductorProps): GreetingConductor => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reportedRef = useRef(false);
  const [phase, setPhase] = useState<GreetingPhase>(() => firstPhaseOf(play));
  const [stilled, setStilled] = useState(false);
  const [board, setBoard] = useState<GreetingBoard | null>(null);
  const [shot, setShot] = useState<GreetingBurstShot | null>(null);
  const { scrollY } = useKkShellScroll();
  const dock = useConfettiDock();
  const duration = board?.schedule.duration ?? null;
  const burstAt = board?.schedule.burstAt ?? null;
  const faces = board?.faces ?? null;

  const interrupt = (): void => {
    setPhase('settled');
  };

  const publish = (next: GreetingBoard): void => {
    setBoard((current) => (sameBoard(current, next) ? current : next));
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

  const fire = useEffectEvent((): void => {
    if (dock.isDocked()) {
      dock.replayLanding();

      return;
    }

    const origin = burstOriginIn(rootRef.current);

    if (origin !== null) {
      setShot({ key: Date.now(), origin });
    }
  });

  const report = useEffectEvent((settled: readonly string[]): void => {
    onSettled([...settled]);
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
    if (phase !== 'playing' || duration === null) {
      return;
    }

    const burstTimer = burstAt === null ? null : window.setTimeout(fire, burstAt);
    const settleTimer = window.setTimeout(() => {
      setPhase('settled');
    }, duration);

    return () => {
      window.clearTimeout(settleTimer);

      if (burstTimer !== null) {
        window.clearTimeout(burstTimer);
      }
    };
  }, [phase, duration, burstAt]);

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

  useEffect(() => {
    if (phase !== 'settled' || faces === null || reportedRef.current) {
      return;
    }

    reportedRef.current = true;
    report(faces);
  }, [phase, faces]);

  return {
    stage: {
      play: stilled ? 'still' : play,
      festive,
      night,
      burst,
      phase,
      board,
      rootRef,
      publish,
      interrupt,
    },
    shot,
  };
};

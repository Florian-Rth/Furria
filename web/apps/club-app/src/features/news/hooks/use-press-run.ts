import { useEffect, useRef, useState } from 'react';
import type { PressKind, PressPhase } from '../press-run';
import {
  isPressBusy,
  PRESS_BEATS_MS,
  pressCuesAfterRegister,
  registerRemainderOf,
} from '../press-run';
import type { NewsPublication } from '../types';

export type { PressKind, PressPhase } from '../press-run';

export interface PressRun {
  phase: PressPhase;
  kind: PressKind;
  failed: boolean;
  result: NewsPublication | null;
  runKey: number;
  start: (kind: PressKind, job: () => Promise<NewsPublication>) => void;
}

interface PressRunHandlers {
  onPublished: (post: NewsPublication) => void;
  onFailed: () => void;
}

export const usePressRun = (handlers: PressRunHandlers): PressRun => {
  const [phase, setPhase] = useState<PressPhase>('idle');
  const [kind, setKind] = useState<PressKind>('first');
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<NewsPublication | null>(null);
  const [runKey, setRunKey] = useState(0);
  const timers = useRef<number[]>([]);
  const latestHandlers = useRef(handlers);

  useEffect(() => {
    latestHandlers.current = handlers;
  });

  useEffect(
    () => () => {
      for (const timer of timers.current) {
        window.clearTimeout(timer);
      }
    },
    [],
  );

  const later = (milliseconds: number, step: () => void): void => {
    timers.current.push(window.setTimeout(step, milliseconds));
  };

  const play = (post: NewsPublication): void => {
    for (const cue of pressCuesAfterRegister()) {
      later(cue.atMs, () => {
        setPhase(cue.phase);
        if (cue.phase === 'stamp') {
          latestHandlers.current.onPublished(post);
        }
      });
    }
  };

  const slip = (): void => {
    setFailed(true);
    later(PRESS_BEATS_MS.slip, () => {
      setFailed(false);
      setPhase('idle');
      latestHandlers.current.onFailed();
    });
  };

  const start = (nextKind: PressKind, job: () => Promise<NewsPublication>): void => {
    if (isPressBusy(phase)) {
      return;
    }
    const startedAt = performance.now();
    setKind(nextKind);
    setResult(null);
    setFailed(false);
    setRunKey((key) => key + 1);
    setPhase('register');
    void job().then(
      (post) => {
        setResult(post);
        later(registerRemainderOf(performance.now() - startedAt), () => {
          play(post);
        });
      },
      () => {
        later(registerRemainderOf(performance.now() - startedAt), slip);
      },
    );
  };

  return { phase, kind, failed, result, runKey, start };
};

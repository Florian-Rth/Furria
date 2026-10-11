import { useEffect, useRef, useState } from 'react';
import type { CeremonyCue, CeremonyOutcome } from './internal/logic/ceremony-schedule';
import { ceremonyCuesOf } from './internal/logic/ceremony-schedule';
import type { KkPressPhase } from './internal/logic/press-beats';
import { isKkPressBusy, isKkPressStamped } from './internal/logic/press-beats';
import type { KkPublishStamp } from './publish-stamp';

export interface KkPublishCeremonyStage {
  phase: KkPressPhase;
  failed: boolean;
  runKey: number;
  stamp: KkPublishStamp | null;
}

export interface KkPublishCeremonyRun<T> extends KkPublishCeremonyStage {
  isBusy: boolean;
  start: (publish: () => Promise<T>) => void;
}

interface KkPublishCeremonyOptions<T> {
  stampOf: (result: T, stampedAt: string) => KkPublishStamp;
  onPublished?: (result: T) => void;
  onFinished?: (result: T) => void;
  onFailed?: (error: Error) => void;
}

interface Published<T> {
  result: T;
  stampedAt: string;
}

export const useKkPublishCeremony = <T>(
  options: KkPublishCeremonyOptions<T>,
): KkPublishCeremonyRun<T> => {
  const [phase, setPhase] = useState<KkPressPhase>('idle');
  const [failed, setFailed] = useState(false);
  const [published, setPublished] = useState<Published<T> | null>(null);
  const [runKey, setRunKey] = useState(0);
  const timers = useRef<number[]>([]);
  const latest = useRef(options);

  useEffect(() => {
    latest.current = options;
  });

  useEffect(
    () => () => {
      for (const timer of timers.current) {
        window.clearTimeout(timer);
      }
    },
    [],
  );

  const schedule = (
    outcome: CeremonyOutcome,
    startedAt: number,
    play: (cue: CeremonyCue) => void,
  ): void => {
    for (const cue of ceremonyCuesOf(outcome, performance.now() - startedAt)) {
      timers.current.push(
        window.setTimeout(() => {
          play(cue);
        }, cue.atMs),
      );
    }
  };

  const playPublished = (result: T, cue: CeremonyCue): void => {
    switch (cue.beat) {
      case 'stamp':
        setPublished({ result, stampedAt: new Date().toISOString() });
        setPhase('stamp');
        latest.current.onPublished?.(result);
        return;
      case 'finished':
        latest.current.onFinished?.(result);
        return;
      case 'strike':
      case 'cut':
      case 'settled':
        setPhase(cue.beat);
        return;
      case 'slip':
      case 'recover':
        return;
    }
  };

  const playFailed = (error: Error, cue: CeremonyCue): void => {
    if (cue.beat === 'slip') {
      setFailed(true);
      return;
    }
    setFailed(false);
    setPhase('idle');
    latest.current.onFailed?.(error);
  };

  const start = (publish: () => Promise<T>): void => {
    if (isKkPressBusy(phase)) {
      return;
    }
    const startedAt = performance.now();
    setPublished(null);
    setFailed(false);
    setRunKey((key) => key + 1);
    setPhase('register');
    void publish().then(
      (result: T) => {
        schedule('published', startedAt, (cue) => {
          playPublished(result, cue);
        });
      },
      (error: Error) => {
        schedule('failed', startedAt, (cue) => {
          playFailed(error, cue);
        });
      },
    );
  };

  const stamp =
    isKkPressStamped(phase) && published !== null
      ? options.stampOf(published.result, published.stampedAt)
      : null;

  return { phase, failed, runKey, stamp, isBusy: isKkPressBusy(phase), start };
};

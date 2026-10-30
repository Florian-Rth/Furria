import {
  ACTS_TONIGHT,
  MINUTES_TOTAL,
  RUNNING_FOR,
  toActsTonightLabel,
  toEveningTook,
  toRunningLabel,
  toStageMeta,
} from '../heute-a-copy';
import { clockReadingOf, spanOf } from '../heute-board';
import type { HeuteA } from './use-heute-a';
import { useTickingNow } from './use-ticking-now';

export interface ClockFace {
  count: number | null;
  label: string;
  title: string;
  stepMeta: string | null;
}

export const useClockFace = (heute: HeuteA): ClockFace => {
  const nowMs = useTickingNow();
  const reading = clockReadingOf(heute.flow, heute.live, heute.actCount, nowMs);
  const span = spanOf(reading.eveningSeconds ?? 0);

  if (reading.kind === 'ended') {
    return {
      count: reading.count,
      label: toEveningTook(span),
      title: MINUTES_TOTAL,
      stepMeta: toEveningTook(span),
    };
  }
  if (reading.kind === 'running') {
    const minutes = reading.count ?? 0;

    return {
      count: minutes,
      label: toRunningLabel(minutes),
      title: RUNNING_FOR,
      stepMeta: toStageMeta(heute.flow.now?.group?.name ?? null, span),
    };
  }

  return {
    count: reading.count,
    label: toActsTonightLabel(heute.actCount),
    title: ACTS_TONIGHT,
    stepMeta: null,
  };
};

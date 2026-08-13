import { useEffect, useState } from 'react';
import { deriveCountdown, formatCountdownLabel } from '../countdown';

const SECOND_TICK_MS = 1000;
const MINUTE_TICK_MS = 60_000;

export const useCountdown = (targetIso: string): string | null => {
  const [now, setNow] = useState<Date>(() => new Date());
  const countdown = deriveCountdown(targetIso, now);
  const showsSeconds = countdown !== null && countdown.days === 0 && countdown.hours === 0;
  const tickMs = showsSeconds ? SECOND_TICK_MS : MINUTE_TICK_MS;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), tickMs);
    return () => window.clearInterval(timer);
  }, [tickMs]);

  return countdown === null ? null : formatCountdownLabel(countdown);
};

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_WIDTH = 2;

export const secondsUntil = (expiresAt: string, now: Date): number =>
  Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / MS_PER_SECOND));

export const formatCountdown = (seconds: number): string => {
  const whole = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = String(whole % SECONDS_PER_MINUTE).padStart(SECONDS_WIDTH, '0');

  return `${minutes}:${rest}`;
};

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
const BYTE_STEP = 1024;
const PRECISE_BELOW = 10;
const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 3600;
const DAY_SECONDS = 86_400;
const HOURS_BEFORE_DAYS = 48;
const PERCENT = 100;
const BUILD_SEPARATOR = '+';
const SHORT_COMMIT_LENGTH = 7;

const decimal = (value: number, digits: number): string =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits }).format(value);

const pad = (value: number): string => String(value).padStart(2, '0');

export const formatBytes = (bytes: number): string => {
  let value = Math.max(bytes, 0);
  let unit = 0;

  while (value >= BYTE_STEP && unit < BYTE_UNITS.length - 1) {
    value /= BYTE_STEP;
    unit += 1;
  }

  const digits = unit > 0 && value < PRECISE_BELOW ? 1 : 0;

  return `${decimal(value, digits)} ${BYTE_UNITS[unit] ?? 'B'}`;
};

export const formatCount = (count: number): string => decimal(count, 0);

export const formatSpan = (seconds: number): string => {
  const span = Math.max(seconds, 0);

  if (span < MINUTE_SECONDS) {
    return '< 1 Min';
  }
  if (span < HOUR_SECONDS) {
    return `${Math.floor(span / MINUTE_SECONDS)} Min`;
  }
  if (span < HOURS_BEFORE_DAYS * HOUR_SECONDS) {
    return `${Math.floor(span / HOUR_SECONDS)} Std`;
  }

  return `${Math.floor(span / DAY_SECONDS)} Tg`;
};

export const formatPercent = (share: number): string =>
  `${Math.round(Math.min(Math.max(share, 0), 1) * PERCENT)} %`;

export const formatClock = (moment: Date): string =>
  `${pad(moment.getHours())}:${pad(moment.getMinutes())}`;

export const formatClockSeconds = (moment: Date): string =>
  `${formatClock(moment)}:${pad(moment.getSeconds())}`;

export const formatShortDate = (moment: Date): string =>
  `${pad(moment.getDate())}.${pad(moment.getMonth() + 1)}.`;

export const formatDate = (moment: Date): string =>
  `${formatShortDate(moment)}${moment.getFullYear()}`;

export const formatVersion = (version: string): string => {
  const [release, build] = version.split(BUILD_SEPARATOR);

  return build === undefined || build === ''
    ? version
    : `${release} · ${build.slice(0, SHORT_COMMIT_LENGTH)}`;
};

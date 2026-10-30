const CLOCK = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});

const ROUNDING_MS = 5 * 60 * 1000;
const OPENING_POSITION = 0;

const roundedOf = (instant: number): Date =>
  new Date(Math.round(instant / ROUNDING_MS) * ROUNDING_MS);

export const toStageTime = (position: number, stageStartsAt: string): string => {
  const instant = Date.parse(stageStartsAt);

  return position === OPENING_POSITION
    ? CLOCK.format(new Date(instant))
    : `ca. ${CLOCK.format(roundedOf(instant))}`;
};

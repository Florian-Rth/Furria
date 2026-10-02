const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;

export const msUntilNextMinute = (now: Date): number =>
  MS_PER_MINUTE - (now.getSeconds() * MS_PER_SECOND + now.getMilliseconds());

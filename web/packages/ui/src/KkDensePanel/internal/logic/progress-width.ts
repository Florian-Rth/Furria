const PERCENT = 100;
const DECIMALS = 10;

export const toProgressWidth = (progress: number | null | undefined): string | null => {
  if (progress === null || progress === undefined || !Number.isFinite(progress)) {
    return null;
  }

  const share = Math.min(Math.max(progress, 0), 1);

  return `${Math.round(share * PERCENT * DECIMALS) / DECIMALS}%`;
};

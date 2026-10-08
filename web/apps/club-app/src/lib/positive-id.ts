const POSITIVE_ID_PATTERN = /^[1-9]\d*$/;

export const parsePositiveId = (raw: string | undefined): number | null =>
  raw !== undefined && POSITIVE_ID_PATTERN.test(raw) ? Number(raw) : null;

export const isSessionClosed = (sessionYear: number | null, relevantYear: number): boolean =>
  sessionYear !== null && sessionYear < relevantYear;

export const sessionSearchOf = (
  sessionYear: number | null,
  relevantYear: number,
): number | undefined =>
  sessionYear === null || sessionYear === relevantYear ? undefined : sessionYear;

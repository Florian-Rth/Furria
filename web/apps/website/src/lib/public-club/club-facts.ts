const MEMBER_COUNT_STEP = 10;

export const UNKNOWN_FACT = '—';

export const formatMemberCount = (memberCount: number): string =>
  memberCount < MEMBER_COUNT_STEP
    ? String(memberCount)
    : `${Math.floor(memberCount / MEMBER_COUNT_STEP) * MEMBER_COUNT_STEP}+`;

export const buildMailHref = (email: string): string => `mailto:${email}`;

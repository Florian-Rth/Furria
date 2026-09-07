import type { MembershipStatus, MembershipType } from '@/lib/api/schemas';

const MEMBERSHIP_TYPE_LABELS: Record<MembershipType, string> = {
  active: 'Aktiv',
  youth: 'Jugend',
  honorary: 'Ehren',
};

const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'aktiv',
  paused: 'ruht',
  left: 'beendet',
};

const ISO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const toMembershipTypeLabel = (type: MembershipType): string => MEMBERSHIP_TYPE_LABELS[type];

export const toMembershipStatusLabel = (status: MembershipStatus): string =>
  MEMBERSHIP_STATUS_LABELS[status];

export const formatIsoDay = (isoDay: string): string => {
  if (!ISO_DAY_PATTERN.test(isoDay)) {
    return isoDay;
  }
  return `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}.${isoDay.slice(0, 4)}`;
};

export const formatMembershipPeriod = (startedAt: string, endedAt: string | null): string => {
  const since = `seit ${formatIsoDay(startedAt)}`;
  if (endedAt === null) {
    return since;
  }
  return `${since} bis ${formatIsoDay(endedAt)}`;
};
